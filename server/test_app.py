import json
import random
from pprint import pprint

import converter
import server
from app import app
from server import load_question


def call_get_feedback(graph, answer):
    json_graph = converter.nx2cy(graph)
    data = {'answer': answer, 'graph': json_graph}
    response = app.test_client().post(
        '/api/feedback/euler.py/EulerWalk',
        data=json.dumps(data),
        content_type='application/json'
    )
    return response


def test_get_feedback():
    # Load the question
    q = load_question('euler.py', 'EulerWalk')
    graph = q.generate_data()

    # Generate a correct and incorrect answer
    sols = q.generate_solutions(graph)
    ans_cor = random.choice(sols)
    ans_inc = [1, 2, 3, 4, 5]
    while ans_inc in sols:
        ans_inc = [random.randint(0, 5) for _ in range(random.randint(2, 8))]

    # Test the correct answer
    response = call_get_feedback(graph, ans_cor)
    assert response.status_code == 200
    res = json.loads(response.data.decode('utf-8'))
    assert res['result']
    assert res['feedback'] != ''

    # Test the incorrect answer
    response = call_get_feedback(graph, ans_inc)
    assert response.status_code == 200
    res = json.loads(response.data.decode('utf-8'))
    assert not res['result']
    assert res['feedback'] != ''


def test_graph():
    q = server.generate_question('test.py', 'TestWeighted')
    pprint(q)

    q = server.generate_question('test.py', 'TestSelectVertex')
    pprint(q)


def test_generate_question():
    data = server.generate_question('euler.py', 'EulerWalk')
    assert data is not None


def test_subgraph():
    q = server.generate_question('test.py', 'TestMultipleGraphs')
    pprint(q)
