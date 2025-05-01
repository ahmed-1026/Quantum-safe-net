import pika
import sys
import time
import json
from typing import Any

MAX_RETRIES = 5

class RabbitMQPublisher:
    def __init__(self):
        self.connection = None
        self.channel = None

    def connect(self):
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(
            host="amq.globalcompany.cc",
            port=5672,
            credentials=pika.PlainCredentials("admin", "ac@1ncjdiye"),
            heartbeat=600,
        ))
        self.channel = self.connection.channel()
        self.channel.confirm_delivery()

        # Declare the exchange
        self.channel.exchange_declare(exchange="utils_exchange", exchange_type="direct", durable=True)
        # Declare the queue
        self.channel.queue_declare(queue="utils_queue", durable=True)
        # Bind the queue to the exchange
        self.channel.queue_bind(exchange="utils_exchange", queue="utils_queue", routing_key="system_utils")

    def publish_to_exchange(self, message: Any, retries=0):
        if retries >= MAX_RETRIES:
            print(f"[!] Max retries reached. Failed to publish message to RabbitMQ")
            sys.exit(1)
        
        try:
            if not self.connection or self.connection.is_closed:
                self.connect()

            self.channel.basic_publish(
                exchange="utils_exchange",
                routing_key="system_utils",
                body=json.dumps(message).encode(),
                properties=pika.BasicProperties(content_type='application/json', delivery_mode=2),
                mandatory=True
            )
            print(f"[x] Sent '{message}' successfully.")
        
        except (pika.exceptions.ConnectionClosed, pika.exceptions.AMQPError) as e:
            print(f"[!] Connection error: {e}. Retrying...")
            self.close()
            time.sleep(5)
            return self.publish_to_exchange(message, retries + 1)
        
        except Exception as e:
            print(f"[!] Error publishing message: {e}")
            self.close()
            time.sleep(5)
            return self.publish_to_exchange(message, retries + 1)

    def close(self):
        if self.channel and self.channel.is_open:
            self.channel.close()
        if self.connection and self.connection.is_open:
            self.connection.close()

if __name__ == "__main__":
    publisher = RabbitMQPublisher()

    try:
        message = {
            "type": "config_update",
            "server_ip": "164.90.163.57",
            "files": [
                {
                    "path": "/etc/xray/config.json",
                    "content": "...your_json_here..."
                }
            ],
            "services": ["xray.service"],
            "commands": {"pre": [""], "post": [""]}
        }

        # Example: publish the same message 3 times
        while True:
            print(f"[x] Publishing message: {message}")
            print(publisher.publish_to_exchange(message))
            time.sleep(1)  # slight delay if needed between messages
            input("Press Enter to publish again or Ctrl+C to exit...")

    finally:
        publisher.close()
