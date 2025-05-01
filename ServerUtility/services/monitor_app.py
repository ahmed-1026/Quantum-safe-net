import datetime
import json
import os
import subprocess
import sys
import time
from typing import Dict, Callable

import pika
import psutil

from models import MonitorConfig, Service
from models.shared_logger import setup_logger
from services import ConfigUpdate

MAX_RETRIES = 5
logger = setup_logger()
class MonitorApp:
    config: MonitorConfig
    pikaConnection: pika.BlockingConnection
    LAST_HANDSHAKE_TIME = 3 * 60
    def __init__(self, config: MonitorConfig, version: str) -> None:
        self.config = config
        self.publisherChannel = self.get_publisher_channel()
        self.version = version

    @classmethod
    def from_json(cls, json_data: Dict) -> 'MonitorApp':
        return cls(
            MonitorConfig.from_json(json_data)
        )

    def get_publisher_channel(self):
        while True:
            try:
                pikaConnection = pika.BlockingConnection(
                    pika.ConnectionParameters(
                        host=self.config.rabbitmq.host,
                        port=self.config.rabbitmq.port,
                        credentials=pika.PlainCredentials(self.config.rabbitmq.username, self.config.rabbitmq.password),
                        connection_attempts=5,
                       retry_delay=5,
                        heartbeat=600
                    )
                )
                channel = pikaConnection.channel()
                channel.exchange_declare(exchange=self.config.rabbitmq.publisher.exchange, exchange_type='direct', durable=True, auto_delete=False)
                channel.queue_declare(queue=self.config.rabbitmq.publisher.queue,durable=True, auto_delete=False)
                channel.queue_bind(exchange=self.config.rabbitmq.publisher.exchange, queue=self.config.rabbitmq.publisher.queue, routing_key=self.config.rabbitmq.publisher.routing_key)
                channel.confirm_delivery()
                return channel
            except Exception as e:
                print(f" [!] Error connecting to RabbitMQ: {e}")
                time.sleep(5)

    def check_service_status(self,service_name):
        try:
            subprocess.run(['systemctl', 'is-active', '--quiet', service_name], check=True)
            return "active"
        except subprocess.CalledProcessError:
            return "inactive"

    def get_shadowsocks_online_users(self, service: Service):
        port = service.port
        if service.type != Service.SHADOWSOCKS or port <= 0:
            return 0
        try:
            # Run the ss command and get output
            result = subprocess.run(
               f"ss -ntu state established sport = :{port} | awk '{{print $5}}' | cut -d: -f1 | sort -u | wc -l",
               capture_output=True, text=True, shell=True, check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            print(f"Error executing command: {e}")
            return 0

    def get_openvpn_online_users(self, service: Service):
        port = service.port
        if service.type != Service.OPENVPN or port <= 0:
            return 0
        telnet_output = subprocess.check_output(
            f"expect <<-EOF\n"
            f"spawn telnet localhost {port}\n"
            f"set timeout 5\n"
            f"expect \"OpenVPN Management Interface\"\n"
            f"send \"status 3\\r\"\n"
            f"expect \"END\"\n"
            f"send \"exit\\r\"\n"
            f"EOF", shell=True, stderr=subprocess.DEVNULL
        )
        return len([line for line in telnet_output.decode().splitlines() if line.startswith("CLIENT_LIST")])

    def get_openconnect_online_users(self, service: Service) -> int:
        if service.type != Service.OPENCONNECT:
            return 0
        try:
            # Execute the 'who -q' command and capture the output
            result = subprocess.run(["sudo", "-S", "who", "-q"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            output = result.stdout.splitlines()
            if output:
                # The first line contains the user names, count words in it
                user_count = len(output[0].split())
                return user_count
            else:
                return 0
        except subprocess.CalledProcessError as e:
            print("Error executing 'who -q' command:", e)
            return 0


    def get_wireguard_online_users(self, service: Service):
        if service.type != Service.WIREGUARD:
            return 0
        try:
            exe = service.exe
            if exe == "":
                exe = "wg"
            # Run the wg show command to get all dump data
            result = subprocess.run(["sudo", exe, "show", "all", "dump"], capture_output=True, text=True, check=True)
            output = result.stdout.strip()
        except subprocess.CalledProcessError as e:
            print("Error executing WireGuard command:", e)
            return 0

        current_time = int(time.time())
        threshold = current_time - self.LAST_HANDSHAKE_TIME
        wg_users = []

        for line in output.splitlines():
            fields = line.split('\t')
            if len(fields) < 9:
                continue

            device, public_key, preshared_key, endpoint, allowed_ips, latest_handshake, transfer_rx, transfer_tx, persistent_keepalive = fields

            latest_handshake = int(latest_handshake)
            transfer_rx = int(transfer_rx)
            transfer_tx = int(transfer_tx)
            persistent_keepalive = 0 if persistent_keepalive == "off" else int(persistent_keepalive)

            if latest_handshake >= threshold:
                user_data = {
                    "publicKey": public_key,
                }

                if preshared_key != "(none)":
                    user_data["presharedKey"] = preshared_key
                if endpoint != "(none)":
                    user_data["endpoint"] = endpoint
                if transfer_rx != 0:
                    user_data["transferRx"] = transfer_rx
                if transfer_tx != 0:
                    user_data["transferTx"] = transfer_tx
                if latest_handshake != 0:
                    user_data["latestHandshake"] = latest_handshake
                    user_data["_latestHandshake"] = datetime.fromtimestamp(latest_handshake).isoformat()
                if persistent_keepalive != 0:
                    user_data["persistentKeepalive"] = persistent_keepalive

                allowed_ips_list = allowed_ips.split(',')
                user_data["allowedIps"] = allowed_ips_list

                wg_users.append(user_data)

        return len(wg_users)

    def get_connected_users(self):
        total_users = 0
        for service in self.config.services:
            try:
                if service.type == Service.OPENVPN:
                    total_users += self.get_openvpn_online_users(service)
                elif service.type == Service.WIREGUARD:
                    total_users += self.get_wireguard_online_users(service)
                elif service.type == Service.SHADOWSOCKS:
                    ssTotal = self.get_shadowsocks_online_users(service)
                    total_users += int(ssTotal)
                elif service.type == Service.OPENCONNECT:
                    total_users += self.get_openconnect_online_users(service)
            except Exception as e:
                print(f" [!] Error fetching users for service on port {service.port}: {e}")
        return total_users

    def get_cpu_usage(self):
        core_usages = psutil.cpu_percent(percpu=True, interval=1)
        avg_cpu_usage = sum(core_usages) / len(core_usages)
        return avg_cpu_usage

    # Function to get system info
    def get_system_info(self):
        # dummy response
        return {
            "version": "1.0.0",
            "server_ip": self.config.server.ip,
            "cpu_usage_percent": "23.5",
            "total_connected_users": "100",
            "service_statuses": {
                "ss_server": "active",
                "wg_server": "inactive",
                "openvpn_server": "active",
                "openconnect_server": "inactive"
            }
        }

        service_statuses = {service.name: self.check_service_status(service.name) for service in self.config.services}
        return {
            "version": self.version,
            "server_ip": self.config.server.ip,
            "cpu_usage_percent": self.get_cpu_usage(),
            "total_connected_users": self.get_connected_users(),
            "service_statuses": service_statuses
        }

    def send_to_rabbitmq(self, data, retries=0):
        if retries >= MAX_RETRIES:
            print(f" [!] Max retries reached. Failed to send data to RabbitMQ: {data}")
            sys.exit(1)
        try:
            self.publisherChannel.basic_publish(
                exchange=self.config.rabbitmq.publisher.exchange,
                routing_key=self.config.rabbitmq.publisher.routing_key,
                body=json.dumps(data),
                properties=pika.BasicProperties(content_type='application/json', delivery_mode=2)
            )
            print(f" [x] Sent data to RabbitMQ: {data}")
        except Exception as e:
            print(f" [!] Error sending data to RabbitMQ: {e}")
            time.sleep(5)
            self.publisherChannel = self.get_publisher_channel()
            self.send_to_rabbitmq(data, retries + 1)

    def execute_command(self,commands):
        allOutput = {}
        for command in commands:
            try:
                if len(command.strip()) <= 0:
                    continue
                result = subprocess.run(command.split(" "), capture_output=True, text=True, check=True)
                output = result.stdout.splitlines()
                allOutput[command] = output
            except subprocess.CalledProcessError as e:
                print(f"Error executing '{command}' command:{e}")
                allOutput[command] = f"Error executing '{command}' command: {e}"
        return allOutput

    def update_file_content(self, path, content):
        try:
            # Create the directory if it doesn't exist
            os.makedirs(os.path.dirname(path), exist_ok=True)
            # Write the content to the file
            with open(path, 'w') as file:
                file.write(content)
            return f"Success: Content written to '{path}'"
        except Exception as e:
            return f"Failure: An error occurred while writing to '{path}'. Error: {str(e)}"

    def handle_config_updates(self, json: Dict):
        response = self.process_updates(ConfigUpdate.from_json(json))
        logger.info(f"[!] Configuration update processed: {response}")
        self.send_to_rabbitmq(response)

    
    def process_updates(self, config: ConfigUpdate):
        output = {
            "type": "config_update",
            "server_ip": config.server_ip,
            "files": [],
            "services": {},
            "commands": {
                "pre": [],
                "post": []
            }
        }
        output['commands']['pre'] = self.execute_command(config.commands.pre)
        for file in config.files:
            file_output = {
                "path": file.path,
                "content": self.update_file_content(file.path, file.content)
            }
            output['files'].append(file_output)
        for service in config.services:
            output['services'][service] = self.execute_command([
                f"systemctl restart {service}",
                f"systemctl status {service}",
            ])
        output['commands']['post'] = self.execute_command(config.commands.post)

        return output
