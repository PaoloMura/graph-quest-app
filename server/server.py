from pprint import pprint

import networkx as nx

from constants import *
import converter
import copy
from graphquest.question import *
from graphquest.test_question import test_file
import random
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


def longest_path(graph: nx.Graph, root):
    digraph = nx.DiGraph(edge for edge in nx.bfs_edges(graph, root))
    return nx.algorithms.dag.dag_longest_path(digraph)


def get_root(graph: nx.Graph):
    nodes = list(graph.nodes)
    r1 = random.choice(nodes)
    l1 = longest_path(graph, r1)
    l2 = longest_path(graph, l1[-1])
    mid = len(l2) // 2
    return l2[mid]


def generate_question(q_file: str, q_class: str) -> dict:
    try:
        q = load_question(q_file, q_class)
    except Exception as e:
        raise type(e)(f'Failed to load question: {e}') from e

    try:
        q_type = type(q).__bases__[0].__name__
        data = q.generate_data()

        if type(data) == nx.Graph:
            q_graphs = [converter.nx2cy(data)]
        else:
            q_graphs = [converter.nx2cy(d) for d in data]
    except Exception as e:
        raise type(e)(f'Failed to generate question data: {e}') from e

    try:
        q_descr = q.generate_question(copy.deepcopy(data))
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

    try:
        if q_sett['layout'] == 'tree':
            roots = q_sett['roots']
            for i, tree in enumerate(data):
                if not roots:
                    q_sett['roots'] = [get_root(tree)]
                elif len(roots) <= i:
                    q_sett['roots'].append(get_root(tree))
                elif roots[i] not in tree.nodes:
                    q_sett['roots'][i] = get_root(tree)
    except Exception as e:
        raise type(e)(f'Failed to set tree root: {e}') from e

    return {
        'file': q_file,
        'class': q_class,
        'type': q_type,
        'settings': q_sett,
        'description': q_descr,
        'graphs': q_graphs,
        'solutions': q_sols
    }
