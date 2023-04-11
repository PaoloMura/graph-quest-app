import networkx as nx
import converter


def main():
    """
    Comment out one of the following lines to generate a graph.
    Check out https://networkx.org/documentation/stable/reference/generators.html
    for more examples of graph generators.
    """
    # G = nx.complete_graph(5)
    # G = nx.cycle_graph(5)
    # G = nx.star_graph(5)
    # G = nx.grid_graph([3, 4])
    G = nx.gnp_random_graph(5, 0.7, seed=None, directed=False)

    # This exports the graph to JSON format to be read and displayed by Cytoscape:
    converter.export(G, False, False)


if __name__ == '__main__':
    main()
