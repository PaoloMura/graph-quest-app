import copy
import sys

import converter
from constants import *
from datetime import datetime, timedelta, timezone
from flask import Flask, request, jsonify, abort, send_from_directory
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    unset_jwt_cookies,
    jwt_required,
    JWTManager)
import json
import os
from pprint import pprint
import random
from resources import delete_topic, update_topic, get_topic, get_questions
from server import load_question, generate_question, test_new_file

# Initial Setup

env = os.getenv("GRAPH_VIS_ENV")
if env == 'development':
    print("Running in development environment...")
    app = Flask(__name__)
    from flask_cors import CORS
    CORS(app)

    app.config["JWT_SECRET_KEY"] = "please-remember-to-change-me"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    jwt = JWTManager(app)

    @app.after_request
    def refresh_expiring_jwts(response):
        try:
            exp_timestamp = get_jwt()["exp"]
            now = datetime.now(timezone.utc)
            target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
            if target_timestamp > exp_timestamp:
                access_token = create_access_token(identity=get_jwt_identity())
                data = response.get_json()
                if type(data) is dict:
                    data["access_token"] = access_token
                    response.data = json.dumps(data)
            return response
        except (RuntimeError, KeyError):
            # Case where there is not a valid JWT. Just return the original response
            return response


    @app.route('/api/token', methods=["POST"])
    def create_token():
        username = request.json.get("username", None)
        password = request.json.get("password", None)
        if username != "test" or password != "test":
            return {"msg": "Wrong email or password"}, 401

        access_token = create_access_token(identity=username)
        response = {"access_token": access_token}
        return response


    @app.route("/api/logout", methods=["POST"])
    def logout():
        response = jsonify({"msg": "logout successful"})
        unset_jwt_cookies(response)
        return response

    @app.route('/api/teacher/content')
    @jwt_required()
    def get_content():
        """Return a list of question files and topics"""
        try:
            filenames = list(filter(lambda x: x.endswith('.py'), os.listdir(QUESTIONS_PATH)))
            files = []
            for file in filenames:
                files.append({
                    "file": file,
                    "questions": get_questions(file)
                })
            with open(TOPICS_FILE, 'r') as f:
                data = json.load(f)
                topics = [{'topic_code': item, 'name': data[item]['name']} for item in data]
            content = {
                'files': files,
                'topics': topics
            }
            return content
        except FileNotFoundError:
            return 'File not found', 404
        except ModuleNotFoundError:
            return 'Module not found', 404


    @app.route('/api/teacher/questions/<file>', methods=['DELETE'])
    @jwt_required()
    def access_file(file):
        """Handle requests on the question file resources"""
        if os.path.exists(QUESTIONS_PATH + file):
            os.remove(QUESTIONS_PATH + file)
            return 'Success', 201
        else:
            return 'File not found', 404


    @app.route('/api/upload/file', methods=['POST'])
    @jwt_required()
    def upload_file():
        """Handle question file upload"""
        file = request.files['file']
        if file.content_type != 'text/x-python-script':
            return 'File type must be a Python script', 400
        filename = file.filename
        destination = QUESTIONS_PATH + filename
        if os.path.exists(destination):
            return 'File already exists', 400
        try:
            file.save(destination)
            error = test_new_file(filename)
            if error is None:
                return 'Success', 201
            else:
                os.remove(destination)
                return error.args[0], 400
        except Exception as e:
            os.remove(destination)
            return f'Failed validation: {e}', 400


    @app.route('/api/download/<file>', methods=['GET'])
    @jwt_required()
    def download_file(file):
        """Handle question file download"""
        if '/' in file or '..' in file or len(file) < 4 or file[-3:] != '.py':
            return 'Bad request: filename not valid', 400
        return send_from_directory(QUESTIONS_PATH, file, mimetype='text/plain', as_attachment=True, download_name=file)


    @app.route('/api/teacher/topics/<topic_code>', methods=['GET', 'PUT', 'DELETE'])
    @jwt_required()
    def access_topic(topic_code):
        """Handle requests on the topics resource for teachers"""
        if request.method == 'DELETE':
            return delete_topic(topic_code)
        elif request.method == 'PUT':
            data = dict()
            data['name'] = request.json.get('name')
            data['description'] = request.json.get('description')
            data['settings'] = request.json.get('settings')
            data['questions'] = request.json.get('questions')
            return update_topic(topic_code, data)
        elif request.method == 'GET':
            topic = get_topic(topic_code)
            if not topic:
                abort(404)
            else:
                return topic

elif env == 'production':
    print("Running in production environment...")
    app = Flask(__name__, static_folder='build/', static_url_path='/')

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    @app.errorhandler(404)
    def not_found(e):
        return app.send_static_file('index.html')

else:
    print("Error: 'GRAPH_VIS_ENV' environment variable not set. See README.md for details.")
    exit(1)


@app.route('/api/student/topics/<topic_code>', methods=['GET'])
def access_topic_data(topic_code):
    """Handle requests on the topics resource for students"""
    topic, status = get_topic(topic_code)
    if status // 100 != 2:
        return 'Error trying to access topic', status
    result = dict(topic)
    if not topic:
        abort(404)
    for i, question in enumerate(topic['questions']):
        q_file = question['file']
        q_class = question['class']
        try:
            result['questions'][i] = generate_question(q_file, q_class)
        except Exception as e:
            return f'Error trying to access question class "{q_file}:{q_class}": {e}', 404
    if result['settings'].get('random_order', False):
        print('shuffle')
        random.shuffle(result['questions'])
    # pprint(result)
    return result


@app.route('/api/feedback/<q_file>/<q_class>', methods=['POST'])
def get_feedback(q_file, q_class):
    """Handle request for feedback on an answer"""
    try:
        # Load the question
        q = load_question(q_file, q_class)
    except Exception as e:
        return f"Error trying to load the question: {e}", 404

    try:
        # Parse the request JSON
        answer = request.json.get('answer')
        graphs_json = request.json.get('graphs')
        graphs = [converter.cy2nx(g) for g in graphs_json]
        data = request.json.get('data')
        q.data = data
    except Exception as e:
        return f"Error trying to parse the data: {e}", 404

    try:
        # Generate the feedback
        result, feedback = q.generate_feedback(copy.deepcopy(graphs), copy.deepcopy(answer))
        return {'result': result, 'feedback': feedback}
    except Exception as e:
        return f'Error trying to generate feedback: {e}', 404


if __name__ == '__main__':
    if env == 'development':
        app.run()
    elif env == 'production':
        app.run(host='0.0.0.0', port=5000)
    else:
        print("Error: 'GRAPH_VIS_ENV' environment variable not set. See README.md for details.")
        exit(1)
