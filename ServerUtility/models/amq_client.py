from typing import Dict


class AMQClient:
    exchange: str
    queue: str
    routing_key: str

    def __init__(self, exchange: str, queue: str, routing_key: str) -> None:
        self.exchange = exchange
        self.queue = queue
        self.routing_key = routing_key

    @classmethod
    def from_json(cls, json_data: Dict) -> 'AMQClient':
        return cls(
            exchange=json_data['exchange'],
            queue=json_data['queue'],
            routing_key=json_data['routing_key']
        )

