import importlib
import inspect
from pprint import pprint

from graphquest.question import Question

from constants import *
import json
import os
import random
import string

# Length of a topic code
N_CODE = 5


def __generate_topic_code(existing_codes: list[str]):
    """Generates a unique code"""
    chars = string.ascii_letters + string.digits
    new_code = ''
    while not new_code:
        for _ in range(N_CODE):
            new_code += random.choice(chars)
        if new_code in existing_codes:
            new_code = ''
    return new_code


def delete_topic(topic_code: str):
    """Deletes the topic with the given name"""
    if os.path.exists(TOPICS_FILE):
        with open(TOPICS_FILE, 'r') as f:
            data = json.load(f)
            if topic_code in data:
                del data[topic_code]
            else:
                return 'Topic not found', 404
        with open(TOPICS_FILE, 'w') as f:
            json.dump(data, f)
        return 'Success', 201
    else:
        return 'File not found', 404


def update_topic(topic_code: str, topic: dict):
    """Updates the topic, or creates it if it does not exist"""
    if os.path.exists(TOPICS_FILE):
        with open(TOPICS_FILE, 'r') as f:
            data = json.load(f)
            if topic_code == '0' or topic_code not in data:
                topic_code = __generate_topic_code(list(data.keys()))
            data[topic_code] = topic
        with open(TOPICS_FILE, 'w') as f:
            json.dump(data, f)
        return topic_code, 201
    else:
        return 'File not found', 404


def get_topic(topic_code: str):
    """Returns the data for the given topic"""
    if os.path.exists(TOPICS_FILE):
        with open(TOPICS_FILE, 'r') as f:
            data = json.load(f)
            if topic_code not in data:
                return {}, 404
            return data[topic_code], 201
    else:
        return {}, 404


def load_module(file: str):
    """Load the specified Python module dynamically"""
    filepath = QUESTIONS_PATH + file.replace('.py', '')
    filepath = filepath.replace('/', '.')
    importlib.invalidate_caches()
    try:
        mod = importlib.import_module(filepath)
        return mod
    except ModuleNotFoundError as e:
        raise e


def get_questions(filename: str) -> [str]:
    """Returns the question classes within the given file"""
    mod = load_module(filename)

    def is_class(x):
        return inspect.isclass(x) and x.__module__ == mod.__name__

    names = [name for name, _ in inspect.getmembers(mod, is_class)]

    questions = []
    for name in names:
        cls = getattr(mod, name)
        if issubclass(cls, Question):
            questions.append(name)

    return questions


if __name__ == '__main__':
    qs = get_questions('test.py')
    pprint(qs)
