import os
import shutil
import subprocess
import sys
from packaging import version

import requests

from models import UpdateUrl

NAME = "monitor"
__version__ = "1.0.0"


class Updater:
    @classmethod
    def version(self):
        return __version__

    def check_for_update(self, config: UpdateUrl, host_version: str):
        try:
            response = requests.get(config.versionUrl, timeout=5)
            latest_version = response.text.strip()
            if version.parse(latest_version) > version.parse(__version__):
                print("New version available:", latest_version)
                self.download_and_replace(config.binaryUrl, host_version)
        except Exception as e:
            print("Update check failed:", e)

    def download_and_replace(self, binaryUrl, host_version: str):
        print("Downloading new version...")
        response = requests.get(binaryUrl+"-"+host_version, stream=True)
        with open(NAME + "_new", "wb") as f:
            shutil.copyfileobj(response.raw, f)
        os.chmod(NAME+"_new", 0o755)

        # Replace current executable
        new_exe = os.path.abspath(NAME + "_new")
        current_exe = os.path.abspath(sys.argv[0])

        os.rename(current_exe, current_exe + ".bak")
        os.rename(new_exe, current_exe)

        print("Update Successful application...")
        print("Restarting Service")
        subprocess.call(["systemctl", "restart", NAME])
        sys.exit(0)
