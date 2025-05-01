from typing import List, Dict

from models import File, Command


class ConfigUpdate:
    type: str
    server_ip: str
    files: List[File]
    services: List[str]
    commands: Command

    def __init__(self, type: str, server_ip: str, files: List[File], services: List[str], commands: Command) -> None:
        self.type = type
        self.server_ip = server_ip
        self.files = files
        self.services = services
        self.commands = commands

    @staticmethod
    def from_json(data: Dict) -> 'ConfigUpdate':
        files = [File.from_json(file_data) for file_data in data.get('files', [])]
        commands = Command.from_json(data.get('commands', {}))
        return ConfigUpdate(
            type=data.get('type', ''),
            server_ip=data.get('server_ip', ''),
            files=files,
            services=data.get('services', []),
            commands=commands
        )
    