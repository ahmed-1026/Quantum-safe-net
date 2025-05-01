from typing import List, Dict


class Command:
    pre: List[str]
    post: List[str]

    def __init__(self, pre: List[str], post: List[str]) -> None:
        self.pre = pre
        self.post = post

    @staticmethod
    def from_json(data: Dict) -> 'Command':
        return Command(pre=data.get('pre', []), post=data.get('post', []))

