import cgi
import importlib
import json

import networkx as nx

import converter
from src.question import *


# Teacher Functions

def upload_question(teacher: str, lesson: str, question: str) -> None:
    pass


def edit_question(teacher: str, lesson: str, question: str):
    pass


def delete_question(teacher: str, lesson: str, question: str):
    pass


# Student Functions

def load_question(teacher: str, file: str, question: str) -> (Question, str):
    # TODO: add handling for modules/classes not found errors
    filepath = f"src.teachers.{teacher}.questions.{file}"
    importlib.invalidate_caches()
    try:
        mod = importlib.import_module(filepath)
        try:
            cls = getattr(mod, question)
            # TODO: use this to determine the question type
        except AttributeError as e:
            raise e
        obj = cls()
        return obj
    except ModuleNotFoundError as e:
        raise e


def get_lesson(teacher: str, lesson: str):
    # TODO: send json over HTTP
    with open(f"teachers/{teacher}/topics/{lesson}.json", "r") as f:
        data = json.load(f)
        with open('sample_topic.json', 'w') as g:
            json.dump(data, g)


def get_question(teacher: str, file: str, question: str):
    # Load the question
    q = load_question(teacher, file, question)

    # Generate its data
    q_type = type(q).__bases__[0].__name__
    graph = q.generate_graph()
    message = q.generate_question(graph)

    # Export to JSON
    converter.export_question(q_type, message, graph)

    # TODO: send over HTTP


def get_answer(teacher: str, file: str, question: str, graph: nx.Graph, solution: list[int]):
    q = load_question(teacher, file, question)
    success = q.verify_solution(graph, solution)
    message = q.generate_feedback(graph, solution)


# Server

def test():
    get_lesson('paolo', 'walks')
    get_question('paolo', 'euler_walk', 'EulerWalk')


def main():
    form = cgi.FieldStorage()
    try:
        answer = form['answer'].value
        print(answer)
    except Exception as e:
        print(e)


if __name__ == '__main__':
    main()
