from abc import ABC, abstractmethod
import networkx as nx


class Question(ABC):
    """
    Methods to implement:

    generate_graph(self) -> nx.Graph
    generate_question(self) -> str
    verify_solution(self, solution: int) -> bool
    generate_feedback(self, graph: nx.Graph, solution: int) -> str
    """
    def __init__(self):
        self.layout = 'force-directed'

    @abstractmethod
    def generate_data(self) -> any:
        """
        Generates a NetworkX graph for the question.

        :return: a NetworkX Graph
        """
        raise NotImplementedError

    @abstractmethod
    def generate_question(self, graph: nx.Graph) -> str:
        """
        Generates the wording of the question.

        :param graph: the NetworkX graph used in the question.
        :return: the question description.
        """
        raise NotImplementedError

    @abstractmethod
    def verify_solution(self, graph: nx.Graph, solution: any) -> bool:
        """
        Checks whether a given solution is correct.

        :param graph: the NetworkX graph used in the question.
        :param solution: the student's choice of answer.
        :return: True if the solution is correct, or False otherwise.
        """
        raise NotImplementedError

    @abstractmethod
    def generate_feedback(self, graph: nx.Graph, solution: any) -> str:
        """
        Generates a message to be displayed when the solution has been submitted.

        :param graph: the NetworkX graph used in the question.
        :param solution: the student's choice of answer.
        :return: the message to be displayed.
        """
        raise NotImplementedError


class QSelectPath(Question):
    @abstractmethod
    def generate_data(self) -> (nx.Graph, nx.Graph):
        """
        Generates a NetworkX graph for the question.

        :return: a NetworkX Graph
        """
        raise NotImplementedError

    @abstractmethod
    def verify_solution(self, graph: nx.Graph, solution: list[int]) -> bool:
        """
        Checks whether a given solution is correct.

        :param graph: the NetworkX graph used in the question.
        :param solution: the student's choice of answer, a list of vertices.
        :return: True if the solution is correct, or False otherwise.
        """
        raise NotImplementedError

    @abstractmethod
    def generate_feedback(self, graph: nx.Graph, solution: list[int]) -> str:
        """
        Generates a message to be displayed when the solution has been submitted.

        :param graph: the NetworkX graph used in the question.
        :param solution: the student's choice of answer, a list of vertices.
        :return: the message to be displayed.
        """
        raise NotImplementedError
