from pprint import pprint

from constants import *
import converter
import copy
from graphquest.question import *
from graphquest.test_question import test_file
import importlib

from resources import load_module


# Question Testing

def test_new_file(file: str):
    try:
        test_file(filepath=QUESTIONS_PATH+file, verbose=False)
        return None
    except AssertionError as e:
        return e


# Question Generation

def load_question(file: str, qclass: str) -> Question:
    """Create an object from the specified file and Question class"""
    try:
        mod = load_module(file)
        try:
            cls = getattr(mod, qclass)
            obj = cls()
            return obj
        except AttributeError as e:
            raise e
    except ModuleNotFoundError as e:
        raise e


def generate_question(q_file: str, q_class: str) -> dict:
    try:
        q = load_question(q_file, q_class)
    except Exception as e:
        raise type(e)(f'Failed to load question: {e}') from e

    try:
        q_type = type(q).__bases__[0].__name__
        data = q.generate_data()
    except Exception as e:
        raise type(e)(f'Failed to generate question data: {e}') from e

    try:
        q_descr = q.generate_question(copy.deepcopy(data))
        q_graphs = [converter.nx2cy(d) for d in data]
    except Exception as e:
        raise type(e)(f'Failed to generate question description: {e}') from e

    try:
        q_sols = list(q.generate_solutions(copy.deepcopy(data)))
    except Exception as e:
        raise type(e)(f'Failed to generate question solutions: {e}') from e

    try:
        q_sett = q.__dict__
    except Exception as e:
        raise type(e)(f'Failed to generate question settings: {e}') from e

    return {
        'file': q_file,
        'class': q_class,
        'type': q_type,
        'settings': q_sett,
        'description': q_descr,
        'graphs': q_graphs,
        'solutions': q_sols
    }
