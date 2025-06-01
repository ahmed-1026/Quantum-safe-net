import asyncio
import os
import threading
import json
import time
import argparse
import sys

from models import MonitorConfig
from models.shared_logger import setup_logger
from services import MonitorApp, Socket, Updater

monitor_app = None
socket_client = None
updater = None
LAST_HANDSHAKE_TIME = 3 * 60
logger = setup_logger()
# Function to load configuration from a file
def load_config(config_path):
    try:
        with open(config_path, 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        logger.exception(f" [!] Configuration file not found: {config_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        logger.exception(f" [!] Error parsing configuration file {config_path}: {e}")
        sys.exit(1)

def handle_sockets():
    # asyncio.run(socket_client.run())
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(socket_client.run())

# Main function to monitor and send data when it changes
def monitor_and_send():
    # Previous system info to detect changes
    previous_info = None
    try:
        while True:
            # Get the current system info
            current_info = monitor_app.get_system_info()

            # Compare with previous info
            if previous_info != current_info:
                monitor_app.send_to_rabbitmq(current_info)
                previous_info = current_info

            # Wait for a second before checking again
            time.sleep(1)

    except KeyboardInterrupt:
        logger.warning("Exiting...")
    except Exception as e:
        logger.exception(f" [!] Unexpected error during Send: {e}")

def safe_wrapper(fn, name):
    try:
        fn()
    except Exception as e:
        logger.exception(f"[💥] Thread '{name}' crashed: {e}")

def main_app():

    if not monitor_app.config.services:
        logger.error(" [!] No services defined in the configuration file.")
        sys.exit(1)
    socket_thread = threading.Thread(
        name="Socket", target=safe_wrapper, args=(handle_sockets, "socket")
    )
    socket_thread.daemon = True
    socket_thread.start()
    # logger.info(f"Monitoring system and sending updates to RabbitMQ...")
    # monitor_and_send()
    socket_thread.join()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Monitor system and send data to RabbitMQ.")
    parser.add_argument("-c", "--config", help="Path to the configuration file.")
    parser.add_argument("-v", "--version", action="store_true", help="Check system version")
    parser.add_argument("-u", "--update", action="store_true", help="Check for Updates and Update the Service")
    args = parser.parse_args()
    updater = Updater()
    if args.version and args.config:
        logger.error("Error: You cannot use -v and -c together.")
        sys.exit(1)
    
    if args.version:
        logger.info(updater.version())
        sys.exit(0)

    if args.config or args.update:
        logger.info(f"Server Utility v{updater.version()}")
        logger.info(f"Loading configuration from: {args.config}")
        config = MonitorConfig.from_json(load_config(args.config))

        # updater.check_for_update(config.update_urls, config.host_version)
        if args.update:
            sys.exit(0)
        monitor_app = MonitorApp(config=config, version=updater.version())
        socket_client = Socket(app=monitor_app)
        try:
            main_app()
        except KeyboardInterrupt:
            logger.warning("Exiting...")
        except Exception as e:
            logger.exception(f" [!] Unexpected error: {e}")
            logger.exception(e.__cause__)
    else:
        logger.error("Error: You must provide either -v, -u or -c.")
        sys.exit(1)


