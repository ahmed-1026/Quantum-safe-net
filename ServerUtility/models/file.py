from typing import Dict


class File:
    path: str
    content: str

    def __init__(self, path: str, content: str) -> None:
        self.path = path
        self.content = content

    @staticmethod
    def from_json(data: Dict) -> 'File':
        return File(path=data.get('path', ''), content=data.get('content', ''))
