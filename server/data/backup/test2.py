import networkx as nx
from graphquest.question import QVertexSet


class EvenDegree(QVertexSet):
    def __init__(self):
        super().__init__(layout='circle')

    def generate_solutions(self, graphs: list[nx.Graph]) -> list[list[int]]:
        g = graphs[0]
        solution = [n for n, d in g.degree if d % 2 == 0]
        return [solution]

    def generate_feedback(self, graphs: list[nx.Graph], answer: list[int]) -> (bool, str):
        pass

    def generate_data(self) -> list[nx.Graph]:
        g = nx.gnp_random_graph(n=8, p=0.4)
        return [g]

    def generate_question(self, graphs: list[nx.Graph]) -> str:
        return 'Select all vertices with even degree.'
