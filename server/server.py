from constants import *
import converter
import copy
from graphquest.question import *
import importlib

from resources import load_module


# Question Testing

def test_file():
    # TODO: verify whether a given question file contains valid classes
    pass


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
    q = load_question(q_file, q_class)
    q_type = type(q).__bases__[0].__name__
    data = q.generate_data()
    q_descr = q.generate_question(copy.deepcopy(data))
    q_sols = list(q.generate_solutions(copy.deepcopy(data)))
    q_sett = q.__dict__
    q_graphs = [converter.nx2cy(d) for d in data]
    return {
        'file': q_file,
        'class': q_class,
        'type': q_type,
        'settings': q_sett,
        'description': q_descr,
        'graphs': q_graphs,
        'solutions': q_sols
    }
