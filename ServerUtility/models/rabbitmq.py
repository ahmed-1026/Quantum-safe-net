from typing import Dict

from models import AMQClient


class RabbitMQ:
    host: str
    port: int
    username: str
    password: str
    publisher: AMQClient

    def __init__(self, host: str, port: int, username: str, password: str, publisher: AMQClient) -> None:
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.publisher = publisher

    @classmethod
    def from_json(cls, json_data: Dict) -> 'RabbitMQ':
        return cls(
            host=json_data['host'],
            port=json_data['port'],
            username=json_data['username'],
            password=json_data['password'],
            publisher=AMQClient.from_json(json_data['publisher'])
        )