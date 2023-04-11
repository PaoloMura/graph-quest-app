import json
import networkx as nx


def __nx2cy(graph: nx.Graph) -> dict:
    """Converts the given NetworkX graph to a JSON dict for Cytoscape."""
    data = nx.cytoscape_data(graph)

    for edge in data['elements']['edges']:
        id = f"{edge['data']['source']}-{edge['data']['target']}"
        edge['data'].update({'id': id})

    return data


def export_question(q_type: str, message: str, graph: nx.Graph):
    """Exports a question to a JSON file."""
    graph_dict = __nx2cy(graph)
    data = {
        'q_type': q_type,
        'message': message,
        'graph': graph_dict
    }
    json_data = json.dumps(data)
    with open("sample_question.json", "w") as outfile:
        outfile.write(json_data)


def export_answer(result: bool, explanation: str):
    """Exports an answer to a JSON file."""
    data = {'result': result, 'explanation': explanation}
    json_data = json.dumps(data)
    with open("sample_answer.json", "w") as outfile:
        outfile.write(json_data)
