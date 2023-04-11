from graphquest.question import *
import networkx


class Test(QTextInput):
    def __init__(self):
        super().__init__()

    def generate_solutions(self, graphs: list[nx.Graph]) -> list[str]:
        pass

    def generate_feedback(self, graphs: list[nx.Graph], answer: str) -> (bool, str):
        pass

    def generate_data(self) -> list[nx.Graph]:
        pass

    def generate_question(self, graphs: list[nx.Graph]) -> str:
        pass


def main():
    pass


if __name__ == '__main__':
    main()
