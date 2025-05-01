from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from starlette.middleware.cors import CORSMiddleware
import re
import subprocess
import textwrap


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_public_ip():
    try:
        # Try to get public IPv4 address
        ipv4_output = subprocess.check_output("ip -4 addr", shell=True, text=True)
        ipv4_matches = re.findall(r'inet (\d+\.\d+\.\d+\.\d+)/\d+.*scope global', ipv4_output)
        if ipv4_matches:
            return ipv4_matches[0]

        # Fallback to public IPv6 address
        ipv6_output = subprocess.check_output("ip -6 addr", shell=True, text=True)
        ipv6_matches = re.findall(r'inet6 ([a-fA-F0-9:]+)/\d+.*scope global', ipv6_output)
        if ipv6_matches:
            return ipv6_matches[0]

        # If neither found, exit or raise
        print("Error: Unable to detect a public IP address. Exiting.")
        return None

    except subprocess.CalledProcessError as e:
        print("Error running IP detection command:", e)
        return None

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

@app.post("/vpn/setup")
def wire_guard_setup(
    server_ip: str, 
    SERVER_PRIV_KEY: str, 
    SERVER_PUB_KEY: str, 
    wg_ip_v4: str = "10.0.0.1", 
    SERVER_WG_NIC: str = "wg0",
    SERVER_PORT: int = "51820", 
    allowed_ips: str = "0.0.0.0/0,::/0"
    ):
    """
    Set up WireGuard server.
    :param server_ip: IP address of the WireGuard server.
    :param SERVER_PORT: Port on which WireGuard server listens.
    """
    try:
        # Check if WireGuard is installed
        response = subprocess.run(["wg", "--version"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if response.returncode != 0:
            raise HTTPException(status_code=500, detail="WireGuard is not installed or not accessible.")
        print("WireGuard is installed.")

        # Check if public ip is valid
        if get_public_ip() != server_ip:
            raise HTTPException(status_code=400, detail="Server IP does not match the public IP of the server.")
        print("Public IP is valid.")
        # Check if server port is valid
        if not (0 < SERVER_PORT < 65536):
            raise HTTPException(status_code=400, detail="Server port must be between 1 and 65535.")
        # check public_nic
        SERVER_PUB_NIC = get_server_pub_nic()
        if SERVER_PUB_NIC is None:
            raise HTTPException(status_code=500, detail="Could not determine public NIC.")

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
            raise HTTPException(status_code=500, detail="WireGuard is not running.")
        print("WireGuard is running.")
        return {
            "message": "WireGuard server setup successfully.",
            "server_ip": server_ip,
            "server_port": SERVER_PORT,
            "wg_ip_v4": wg_ip_v4,
            "wg_nic": SERVER_WG_NIC
        }
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to set up WireGuard: {e.stderr}")

@app.post("/vpn/users")
def new_client(client_name, server_pub_ip: str, server_port, client_ip):
    """
    Create a new WireGuard client.
    :param client_name: Name of the new client.
    :param server_pub_ip: Public IP of the WireGuard server.
    :param server_port: Port on which WireGuard server listens.
    :param client_ip: IP address assigned to the client.
    """
    print("Creating new client...", client_name, server_pub_ip, server_port)
    try:
        if not re.match(r"^[a-zA-Z0-9_-]{1,15}$", client_name):
            raise HTTPException(status_code=400, detail="Client name must be alphanumeric, can include underscores or dashes, and be no longer than 15 characters.")

        endpoint = f"{server_pub_ip}:{server_port}"

        # Generate keys for the client
        client_priv_key = subprocess.check_output(["wg", "genkey"], text=True).strip()
        pubkey_process = subprocess.Popen(["wg", "pubkey"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
        client_pub_key, _ = pubkey_process.communicate(input=client_priv_key)
        client_pub_key = client_pub_key.strip()
        client_pre_shared_key = subprocess.check_output(["wg", "genpsk"], text=True).strip()

        subprocess.run(["wg", "set", "wg0",
            "peer", client_pub_key,
            "preshared-key", "/dev/stdin",
            "allowed-ips", client_ip],
            input=client_pre_shared_key, text=True, check=True)

        return {
            "message": "Successfull"
        }
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to add peer: {e.stderr}")


@app.delete("/vpn/users")
def delete_client(public_key: str):
    """
    Delete an existing WireGuard client.
    :param public_key: Public key of the client to be deleted.
    """
    try:
        subprocess.run(["wg", "set", "wg0", "peer", public_key, "remove"], check=True)

        return {"message": f"Peer {public_key} removed successfully."}

    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove peer: {e.stderr}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8002)