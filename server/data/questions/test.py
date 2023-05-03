from graphquest.graph import random_planar_graph
from graphquest.question import *
import networkx as nx
import random


class Test(QTextInput):
    def __init__(self):
        super().__init__(data_type="integer")

    def generate_data(self) -> list[nx.Graph]:
        n = random.randint(5, 7)
        p = 4 / n
        graph = nx.gnp_random_graph(n, p, seed=None, directed=False)
        return [graph]

    def generate_question(self, graphs: list[nx.Graph]) -> str:
        question = """What is the largest degree in this graph?"""
        return question

    def generate_solutions(self, graphs: list[nx.Graph]) -> list[str]:
        deg = max((d for (n, d) in graphs[0].degree))
        return [str(deg)]

    def generate_feedback(self, graphs: list[nx.Graph], answer: str) -> (bool, str):
        return ""


class TestMCQ(QMultipleChoice):
    def generate_data(self) -> list[nx.Graph]:
        n = random.randint(5, 7)
        p = 0.8
        graph = nx.gnp_random_graph(n, p, seed=None, directed=False)
        return [graph]

    def generate_question(self, graphs: list[nx.Graph]) -> str:
        return "Which of the following statements is true?"

    def generate_solutions(self, graphs: list[nx.Graph]) -> list[[str, bool]]:
        options = list()
        ans1 = len(list(nx.connected_components(graphs[0]))) == 1
        options.append(["The graph is connected", ans1])
        ans2 = min((d for (n, d) in graphs[0].degree)) == 2
        options.append(["The smallest degree in the graph is 2", ans2])
        n = len(list(graphs[0].nodes)) - 1
        ans3 = nx.has_path(graphs[0], 0, n)
        options.append([f"There is a path from v0 to v{n}", ans3])
        return options

    def generate_feedback(self, graphs: list[nx.Graph], answer: list[[str, bool]]) -> (bool, str):
        return ""


class TestMCQ2(QMultipleChoice):
    def __init__(self):
        super().__init__(single_selection=True)

    def generate_data(self) -> list[nx.Graph]:
        n = random.randint(10, 15)
        p = 0.15
        graph = nx.gnp_random_graph(n, p, seed=None, directed=False)
        return [graph]

    def generate_question(self, graphs: list[nx.Graph]) -> str:
        n = len(list(graphs[0].nodes)) - 1
        return f"Is there a path from v0 to v{n}?"

    def generate_solutions(self, graphs: list[nx.Graph]) -> list[[str, bool]]:
        n = len(list(graphs[0].nodes)) - 1
        path_exists = nx.has_path(graphs[0], 0, n)
        return [["Yes", path_exists], ["No", not path_exists]]

    def generate_feedback(self, graphs: list[nx.Graph], answer: list[[str, bool]]) -> (bool, str):
        return ""


class TestVertexSet(QVertexSet):
    def __init__(self):
        super().__init__()

    def generate_data(self) -> nx.Graph:
        n = random.randint(5, 10)
        p = 0.4
        graph = nx.gnp_random_graph(n, p, seed=None, directed=False)
        return graph

    def generate_question(self, graph: nx.Graph) -> str:
        return "Select all vertices with degree > 2"

    def generate_solutions(self, graph: nx.Graph) -> list[[int]]:
        solution = [n for (n, d) in graph.degree if d > 2]
        return [solution]

    def generate_feedback(self, graph: nx.Graph, answer: list[int]) -> (bool, str):
        return ""


class TestSelectVertex(QVertexSet):
    def __init__(self):
        super().__init__(selection_limit=1)

    def generate_data(self) -> nx.Graph:
        n = random.randint(5, 10)
        p = 0.4
        graph = nx.gnp_random_graph(n, p, seed=None, directed=False)
        return graph

    def generate_question(self, graph: nx.Graph) -> str:
        return "Select a vertex that has exactly two neighbours"

    def generate_solutions(self, graph: nx.Graph) -> list[[int]]:
        solution = [[n] for (n, d) in graph.degree if d == 2]
        return solution

    def generate_feedback(self, graph: nx.Graph, answer: list[int]) -> (bool, str):
        return ""


class TestDiGraph(QSelectPath):
    def __init__(self):
        super().__init__()

    def generate_data(self) -> nx.Graph:
        n = 5
        graph = nx.random_k_out_graph(n, 2, 2, self_loops=False)
        while not nx.has_path(graph, 0, n - 1):
            graph = nx.random_k_out_graph(n, 2, 2, self_loops=False)
        return graph

    def generate_question(self, graph: nx.Graph) -> str:
        n = len(list(graphs[0].nodes)) - 1
        return f"Find a simple path in the graph from v0 to v{n}"

    def generate_solutions(self, graph: nx.Graph) -> list[list[int]]:
        n = len(list(graph.nodes)) - 1
        solutions = nx.all_simple_paths(graph, 0, n)
        return list(solutions)

    def generate_feedback(self, graph: nx.Graph, answer: list[int]) -> (bool, str):
        return ''


class TestWeighted(QEdgeSet):
    def __init__(self):
        super().__init__(selection_limit=1, layout='circle')

    def generate_data(self) -> nx.Graph:
        n = random.randint(5, 10)
        p = 0.4
        graph = nx.gnp_random_graph(n, p, seed=None, directed=False)
        for u, v, d in graph.edges(data=True):
            d['weight'] = round(random.random(), 2)
        return graph

    def generate_question(self, graph: nx.Graph) -> str:
        return "Select an edge with weight < 0.5"

    def generate_solutions(self, graph: nx.Graph) -> list[list[list[int, int]]]:
        solutions = [[[u, v]] for u, v, d in graph.edges(data=True) if d['weight'] < 0.5] + \
                    [[[v, u]] for u, v, d in graph.edges(data=True) if d['weight'] < 0.5]
        return solutions

    def generate_feedback(self, graph: nx.Graph, answer: list[list[int, int]]) -> (bool, str):
        return ''


class TestMultipleGraphs(QMultipleChoice):
    def __init__(self):
        super().__init__(single_selection=True)

    def generate_data(self) -> list[nx.Graph]:
        n = random.randint(5, 6)
        p = 0.4
        g1 = nx.gnp_random_graph(n, p, seed=None, directed=False)
        g2 = nx.gnp_random_graph(3, p, seed=None, directed=False)
        return [g1, g2]

    def generate_question(self, graphs: list[nx.Graph]) -> str:
        return "Is G2 an induced subgraph of G1?"

    def generate_solutions(self, graphs: list[nx.Graph]) -> list[[str, bool]]:
        g1 = graphs[0]
        g2 = graphs[1]
        sub = g1.subgraph(g2.nodes)
        is_subgraph = nx.utils.graphs_equal(sub, g2)
        return [
            ["Yes", is_subgraph],
            ["No", not is_subgraph]
        ]

    def generate_feedback(self, graphs: list[nx.Graph], answer: list[[str, bool]]) -> (bool, str):
        return ""


class TestMatching(QEdgeSet):
    def __init__(self):
        super().__init__(layout='bipartite', feedback=True)

    def generate_data(self) -> nx.Graph:
        graph = nx.Graph()

        # Add 2 * n nodes to the graph (each partition has n nodes).
        n = random.randint(4, 7)
        top_nodes = [i for i in range(n)]
        bottom_nodes = [i for i in range(n, 2 * n)]
        graph.add_nodes_from(top_nodes, bipartite=0)
        graph.add_nodes_from(bottom_nodes, bipartite=1)

        # Add edges to the graph from top to bottom partition.
        m = random.randint(n, n + 5)
        edges = []
        while len(edges) < m:
            edge = (random.choice(top_nodes), random.choice(bottom_nodes))
            if edge not in edges:
                edges.append(edge)
        graph.add_edges_from(edges)

        return graph

    def generate_question(self, graph: nx.Graph) -> str:
        return "Find a maximum matching in the graph."

    def generate_solutions(self, graph: nx.Graph) -> list[list[list[int, int]]]:
        return [[[0, 0]]]

    def generate_feedback(self, graph: nx.Graph, answer: list[list[int, int]]) -> (bool, str):
        top_selected = []
        bottom_selected = []

        for (u, v) in answer:
            if u in top_selected or v in bottom_selected:
                return False, 'Two edges cannot share a vertex!'
            top_selected.append(u)
            bottom_selected.append(v)
            graph.remove_edge(u, v)

        for (u, v) in graph.edges:
            if u not in top_selected and v not in bottom_selected:
                return False, f'There is at least one more edge that can be added! ({u}, {v})'

        return True, 'This is a maximal matching!'


class TestLabels(QTextInput):
    def __init__(self):
        super().__init__(layout='force-directed')

    def generate_data(self) -> list[nx.Graph]:
        graph = random_planar_graph(8)
        return [graph]

    def generate_question(self, graphs: list[nx.Graph]) -> str:
        return ""

    def generate_solutions(self, graphs: list[nx.Graph]) -> list[str]:
        return ['']

    def generate_feedback(self, graphs: list[nx.Graph], answer: str) -> (bool, str):
        return ''


def generate_graph(n):
    graph = nx.algorithms.bipartite.random_graph(n, n, 0.5, directed=False)
    top = [n for n, d in graph.nodes(data=True) if d['bipartite'] == 0]
    result = len(nx.algorithms.bipartite.maximum_matching(graph, top_nodes=top)) / 2
    return graph, result


class TestData(QTextInput):
    def __init__(self):
        super().__init__(layout='force-directed',
                         labels=False,
                         feedback=True)

    def generate_data(self) -> list[nx.Graph]:
        # graph = nx.random_tree(10)
        # graph = nx.gn_graph(8)
        graph = random_planar_graph(6, True, 1)
        # graph = nx.gnp_random_graph(8, 0.3)
        for node in graph.nodes:
            graph.nodes[node]['data'] = str(node)
        for u, v in graph.edges:
            graph[u][v]['weight'] = random.randint(1, 10)
        return [graph]

        # n = random.randint(4, 5)
        # p = random.choice(range(n - 2, n))
        #
        # graph, result = generate_graph(n)
        # while result != p:
        #     graph, result = generate_graph(n)
        #
        # return [graph]

    def generate_question(self, graphs: list[nx.Graph]) -> str:
        return 'This is a test for node data.'

    def generate_solutions(self, graphs: list[nx.Graph]) -> list[str]:
        return ['']

    def generate_feedback(self, graphs: list[nx.Graph], answer: str) -> (bool, str):
        self.highlighted_nodes = list(graphs[0].nodes)
        return True, ''


# class TestEditGraph(QEditGraph):
#     pass


if __name__ == '__main__':
    from converter import nx2cy
    from pprint import pprint
    q = TestData()
    gs = q.generate_data()
    d = nx2cy(gs[0])
    pprint(d)
