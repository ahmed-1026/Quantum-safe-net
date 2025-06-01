import os
import subprocess
import textwrap


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
        return True
    else:
        if install_wireguard():
            return True
        else:
            return False

def get_server_pub_nic():
    try:
        output = subprocess.check_output("ip -4 route ls", shell=True, text=True)
        for line in output.splitlines():
            if "default" in line:
                parts = line.split()
                if "dev" in parts:
                    dev_index = parts.index("dev") + 1
                    return parts[dev_index]
    except subprocess.CalledProcessError as e:
        print("Error running command:", e)
        return None

def wire_guard_setup(
    server_ip: str, 
    SERVER_PRIV_KEY: str,
    wg_ip_v4: str = "10.0.0.1", 
    SERVER_WG_NIC: str = "wg0",
    SERVER_PORT: int = 51820,
    ):
    """
    Set up WireGuard server.
    :param server_ip: IP address of the WireGuard server.
    :param SERVER_PRIV_KEY: Private key for the WireGuard server.
    :param SERVER_PORT: Port on which WireGuard server listens.
    """
    try:
        # Check if server port is valid
        if not (0 < SERVER_PORT < 65536):
            return False
        # check public_nic
        SERVER_PUB_NIC = get_server_pub_nic()
        if SERVER_PUB_NIC is None:
            raise False

        # make server configuration file and iptable rules
        with open("/etc/wireguard/wg0.conf", "w") as f:
            f.write(textwrap.dedent(f"""\
                [Interface]
                Address = {wg_ip_v4}
                ListenPort = {SERVER_PORT}
                PrivateKey = {SERVER_PRIV_KEY}x

                PostUp = iptables -I INPUT -p udp --dport {SERVER_PORT} -j ACCEPT
                PostUp = iptables -I FORWARD -i {SERVER_PUB_NIC} -o {SERVER_WG_NIC} -j ACCEPT
                PostUp = iptables -I FORWARD -i {SERVER_WG_NIC} -j ACCEPT
                PostUp = iptables -t nat -A POSTROUTING -o {SERVER_PUB_NIC} -j MASQUERADE
                PostUp = ip6tables -I FORWARD -i {SERVER_WG_NIC} -j ACCEPT
                PostUp = ip6tables -t nat -A POSTROUTING -o {SERVER_PUB_NIC} -j MASQUERADE

                PostDown = iptables -D INPUT -p udp --dport {SERVER_PORT} -j ACCEPT
                PostDown = iptables -D FORWARD -i {SERVER_PUB_NIC} -o {SERVER_WG_NIC} -j ACCEPT
                PostDown = iptables -D FORWARD -i {SERVER_WG_NIC} -j ACCEPT
                PostDown = iptables -t nat -D POSTROUTING -o {SERVER_PUB_NIC} -j MASQUERADE
                PostDown = ip6tables -D FORWARD -i {SERVER_WG_NIC} -j ACCEPT
                PostDown = ip6tables -t nat -D POSTROUTING -o {SERVER_PUB_NIC} -j MASQUERADE
            """))
        print("WireGuard configuration file created.")
        # Enable IP forwarding
        with open("/etc/sysctl.d/wg.conf", "w") as f:
            f.write("net.ipv4.ip_forward = 1\n")
            f.write("net.ipv6.conf.all.forwarding = 1\n")
        
        subprocess.run(["sysctl", "--system"], check=True)
        print("IP forwarding enabled.")
        # Start WireGuard
        subprocess.run(["systemctl", "start", f"wg-quick@{SERVER_WG_NIC}"], check=True)
        print("WireGuard started.")
        subprocess.run(["systemctl", "enable", f"wg-quick@{SERVER_WG_NIC}"], check=True)
        print("WireGuard started.")
        # Check WireGuard status
        response = subprocess.run(["wg", "show"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if response.returncode != 0:
            raise False
        print("WireGuard is running.")
        return True
    except subprocess.CalledProcessError as e:
        return False

def new_client(client_pub_key: str, client_ip):
    """
    Create a new WireGuard client.
    :param client_name: Name of the new client.
    :param server_pub_ip: Public IP of the WireGuard server.
    :param server_port: Port on which WireGuard server listens.
    :param client_ip: IP address assigned to the client.
    """
    try:
        subprocess.run(["wg", "set", "wg0",
            "peer", client_pub_key,
            # "preshared-key", "/dev/stdin",
            "allowed-ips", client_ip],
            # input=client_pre_shared_key, 
            text=True, check=True)

        return True
    except subprocess.CalledProcessError as e:
        return False