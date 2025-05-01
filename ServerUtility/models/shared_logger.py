import logging
import sys

COLORS = {
    'socket':     '\033[92m',  # Green
    'main':    '\033[93m',  # Yellow
    'heartbeat':  '\033[95m',  # Magenta
    'mainthread': '\033[96m',  # Cyan
    'default':    '\033[0m',   # Reset/No color
}

RESET = '\033[0m'


class ThreadColorFormatter(logging.Formatter):
    def format(self, record):
        thread_name = record.threadName.lower()

        # Match thread name to a color or fallback
        for key in COLORS:
            if key in thread_name:
                color = COLORS[key]
                break
        else:
            color = COLORS['default']

        message = super().format(record)
        return f"{color}{message}{RESET}"

def setup_logger(name="app"):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    # Avoid duplicate handlers
    if not logger.handlers:
        formatter = ThreadColorFormatter(
            fmt="%(asctime)s | %(threadName)s | %(levelname)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )

        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)

        logger.addHandler(handler)

    return logger