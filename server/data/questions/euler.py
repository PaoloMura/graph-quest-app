from graphquest.question import QSelectPath
import networkx as nx
from random import randint


class EulerWalk(QSelectPath):
    def __init__(self):
        super().__init__(feedback=True, layout='circle')

    def generate_data(self) -> list[nx.Graph]:
        n = randint(7, 9)
        p = 2 / n
        graph = nx.gnp_random_graph(n, p, seed=None, directed=False)

        def not_eulerian():
            return sum((d % 2 for (_, d) in graph.degree)) not in [0, 2]

        while not_eulerian() or not nx.is_connected(graph):
            graph = nx.gnp_random_graph(n, p, seed=None, directed=False)

        return [graph]

    def generate_question(self, graphs: list[nx.Graph]) -> str:
        return "Find an Euler walk in the graph."

    def __dfs(self, graph: nx.Graph, source: int, visited: list[tuple[int, int]], path: list[int]) -> list[list[int]]:
        neighbors = graph.neighbors(source)
        unvisited = [n for n in neighbors if (source, n) not in visited and (n, source) not in visited]
        # Base case: no unvisited neighbours
        if not unvisited:
            if set(graph.edges) == set(visited):
                return [path.copy()]
            else:
                return []
        # Recursive step: visit the unvisited neighbours
        results = list()
        for node in unvisited:
            edge = [source, node]
            edge.sort()
            visited.append(tuple(edge))
            path.append(node)
            result = self.__dfs(graph, node, visited, path)
            for r in result:
                if r not in results:
                    results.append(r)
            visited.pop()
            path.pop()
        return results

    def generate_solutions(self, graphs: list[nx.Graph]) -> list[list[int]]:
        solutions = list()
        for source in graphs[0].nodes:
            solution = self.__dfs(graphs[0], source, [], [source])
            for r in solution:
                if r not in solutions:
                    solutions.append(r)
        return solutions

    def generate_feedback(self, graphs: list[nx.Graph], solution: list[int]) -> (bool, str):
        correct = True
        graph = graphs[0].copy()
        for i in range(len(solution) - 1):
            v1 = solution[i]
            v2 = solution[i + 1]
            if graph.has_edge(v1, v2):
                graph.remove_edge(v1, v2)
            else:
                correct = False
        correct = correct and nx.is_empty(graph)

        if correct:
            return True, "You found a valid Euler walk."
        else:
            path = list(nx.eulerian_path(graphs[0]))
            result = list(map(lambda x: x[0], path)) + [path[-1][1]]
            return False, f'This is not a valid Euler Walk.\n\nOne possible solution is:\n\n{result}'


if __name__ == '__main__':
    q = EulerWalk()
    g = q.generate_data()
    print('graph:')
    print(g[0].nodes())
    print(g[0].edges())
    print('Generating solutions...')
    s = q.generate_solutions(g)
    s.sort()
    print('solutions:')
    for sol in s:
        print(sol)
        assert q.verify_answer(g, sol)
    print('All tests pass!')
