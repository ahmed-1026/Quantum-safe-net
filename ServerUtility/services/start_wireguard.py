import os
import subprocess


def run_command(command, check=True, capture_output=False):
    return subprocess.run(command, shell=True, check=check,
                          capture_output=capture_output, text=True)

def is_root():
    if os.geteuid() != 0:
        print("You need to run this script as root.")
        return False
    return True

def check_virtualization():
    try:
        result = run_command("systemd-detect-virt", capture_output=True).stdout.strip()
        if result == "openvz":
            print("OpenVZ is not supported.")
            return False
        elif result == "lxc":
            print("LXC is not supported (yet).")
            return False
        return True
    except subprocess.CalledProcessError:
        print("Failed to detect virtualization.")
        return False

def check_os():
    os_info = {}
    with open("/etc/os-release", "r") as f:
        for line in f:
            key, _, value = line.partition("=")
            os_info[key.strip()] = value.strip().strip('"')
    
    os_id = os_info.get("ID", "")
    version_id = os_info.get("VERSION_ID", "0")
    
    if os_id == "ubuntu":
        try:
            release_year = int(version_id.split('.')[0])
            if release_year < 18:
                print(f"Your version of Ubuntu ({version_id}) is not supported. Please use Ubuntu 18.04 or later.")
                return False
            print(f"Detected Ubuntu version: {version_id}")
            return True
        except ValueError:
            print("Could not parse Ubuntu version.")
            return False
    else:
        print("Looks like you aren't running this installer on an Ubuntu system.")
        return False

def install_wireguard():
    print("Installing WireGuard...")
    try:
        run_command("apt-get update")
        run_command("apt-get install -y wireguard iptables resolvconf qrencode")
        os.makedirs("/etc/wireguard", exist_ok=True)
        run_command("chmod 600 -R /etc/wireguard/")
        print("WireGuard installed successfully. You can now configure it.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error during WireGuard installation: {e}")
        return False

def install_wireguard_script():
    if not is_root() or not check_virtualization() or not check_os():
        return False

    if os.path.exists("/etc/wireguard/wg0.conf"):
        print("WireGuard is already installed.")
    else:
        if install_wireguard():
            return True
        else:
            return False
