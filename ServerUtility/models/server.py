from typing import Dict


class Server:
    ip: str

    def __init__(self, ip: str) -> None:
        self.ip = ip

    @classmethod
    def from_json(cls, json_data: Dict) -> 'Server':
        return cls(ip=json_data['ip'])
