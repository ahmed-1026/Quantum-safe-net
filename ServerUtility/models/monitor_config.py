from typing import List, Dict

from models import RabbitMQ, UpdateUrl
from models import Server
from models import Service

class MonitorConfig:
    rabbitmq: RabbitMQ
    server: Server
    services: List[Service]
    socket_server: str
    host_version: str
    update_urls: UpdateUrl

    def __init__(self, rabbitmq: RabbitMQ, server: Server, services: List[Service], socket_server: str, update_urls: UpdateUrl, host_version: str) -> None:
        self.rabbitmq = rabbitmq
        self.server = server
        self.services = services
        self.socket_server = socket_server
        self.update_urls = update_urls
        self.host_version = host_version


    @classmethod
    def from_json(cls, json_data: Dict) -> 'MonitorConfig':
        return cls(
            rabbitmq=RabbitMQ.from_json(json_data['rabbitmq']),
            server=Server.from_json(json_data['server']),
            services=[Service.from_json(service) for service in json_data['services']],
            socket_server=json_data.get('socket_server'),
            update_urls=UpdateUrl.from_json(json_data['updates']),
            host_version=json_data.get('host_version',""),
        )
