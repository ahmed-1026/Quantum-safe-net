import os
import socketio

from services import MonitorApp, Updater
from models.shared_logger import setup_logger


logger = setup_logger(__name__)

sio = socketio.AsyncServer(async_mode='asgi')
class Socket:
    def __init__(self, app: MonitorApp):
        self.sio = socketio.AsyncClient()
        self.sio.on('connect', self.on_connect)
        self.sio.on('message', self.on_message)
        self.sio.on('initialize', self.start_wireguard)
        self.sio.on('add-client', self.add_wireguard_client)
        self.sio.on('command', self.command_execution)
        self.sio.on('config_update', self.config_update)
        self.sio.on('self_update', self.upgrade)
        self.sio.on('disconnect', self.on_disconnect)
        self.host = app.config.socket_server
        self.ip = app.config.server.ip
        self.app = app

    async def on_connect(self):
        logger.info('connection established successfully')

    async def on_message(self, data):
        logger.info('message received: ', data)

    async def start_wireguard(self, data):
        logger.info(f'Starting WireGuard...{data}')
    
    async def add_wireguard_client(self, data):
        logger.info(f'Adding WireGuard client...{data}')

    async def upgrade(self):
        logger.info('Let\'s upgrade ourselves')
        Updater().check_for_update(self.app.config.update_urls, self.app.config.host_version)

    async def config_update(self, data):
        logger.info("[!] Updating Configuration Now.")
        self.app.handle_config_updates(data)

    async def command_execution(self, data):
        logger.info('Server Commanded: ',data)
        self.app.execute_command([data.get("msg", "")])

        keys = data.get("keys")
        if isinstance(keys, list):
            for key in keys:
                await self.sio.emit("wg-response", {
                    "key": key,
                    "serverIp": self.app.config.server.ip,
                })

    async def on_disconnect(self):
        logger.info('disconnected from server')

    async def run(self):
        logger.info(f"Connecting to {self.host}...")
        await self.sio.connect(self.host, auth={"serverIP": self.ip}, wait_timeout=60, retry=True)
        logger.info(f"Connected to {self.host}")
        await self.sio.wait()
