from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import re
import subprocess
import os
import qrcode
from io import BytesIO

app = FastAPI()

@app.get("/vpn/users")
def list_clients(wg_config_path="/etc/wireguard/wg0.conf"):
    """
    List all existing WireGuard clients from the configuration file.
    :param wg_config_path: Path to the WireGuard configuration file.
    :return: List of client names or a message indicating no clients exist.
    """
    try:
        with open(wg_config_path, 'r') as file:
            lines = file.readlines()

        # Find lines starting with "### Client" and extract client names
        clients = [line.split(' ')[2].strip() for line in lines if line.startswith("### Client")]

        if not clients:
            return {"message": "You have no existing clients!"}

        # Format output similar to `nl -s ') '`
        formatted_clients = "\n".join([f"{index + 1}) {client}" for index, client in enumerate(clients)])
        return {"clients": formatted_clients}

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Configuration file not found at {wg_config_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post("/vpn/users")
def new_client(client_name, wg_config_path="/etc/wireguard/wg0.conf", server_pub_ip="192.168.1.1", server_port="51820", dns=("1.1.1.1", "1.0.0.1")):
    """
    Create a new WireGuard client.
    :param client_name: Name of the new client.
    :param wg_config_path: Path to the WireGuard server configuration file.
    :param server_pub_ip: Public IP of the WireGuard server.
    :param server_port: Port on which WireGuard server listens.
    :param dns: Tuple of DNS servers for the client.
    """
    if not re.match(r"^[a-zA-Z0-9_-]{1,15}$", client_name):
        raise HTTPException(status_code=400, detail="Client name must be alphanumeric, can include underscores or dashes, and be no longer than 15 characters.")

    # Ensure IPv6 address has brackets if needed
    if ":" in server_pub_ip and not (server_pub_ip.startswith("[") and server_pub_ip.endswith("]")):
        server_pub_ip = f"[{server_pub_ip}]"

    endpoint = f"{server_pub_ip}:{server_port}"

    # Check if client already exists
    try:
        with open(wg_config_path, "r") as f:
            config_content = f.read()
        if f"### Client {client_name}" in config_content:
            raise HTTPException(status_code=400, detail=f"A client with the name '{client_name}' already exists.")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Configuration file not found at {wg_config_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    # Generate keys for the client
    client_priv_key = subprocess.check_output(["wg", "genkey"], text=True).strip()
    client_pub_key = subprocess.check_output(["echo", client_priv_key, "|", "wg", "pubkey"], text=True, shell=True).strip()
    client_pre_shared_key = subprocess.check_output(["wg", "genpsk"], text=True).strip()

    # Find an available IPv4 address
    base_ip = "10.66.66"
    for dot_ip in range(2, 255):
        client_wg_ipv4 = f"{base_ip}.{dot_ip}"
        if client_wg_ipv4 not in config_content:
            break
    else:
        raise HTTPException(status_code=400, detail="The subnet configured supports only 253 clients.")

    # IPv6 base setup
    base_ipv6 = "fd42:42:42"
    client_wg_ipv6 = f"{base_ipv6}::{dot_ip}"

    # Create client configuration
    client_config = f"""[Interface]
PrivateKey = {client_priv_key}
Address = {client_wg_ipv4}/32,{client_wg_ipv6}/128
DNS = {dns[0]},{dns[1]}

[Peer]
PublicKey = <SERVER_PUBLIC_KEY_PLACEHOLDER>
PresharedKey = {client_pre_shared_key}
Endpoint = {endpoint}
AllowedIPs = 0.0.0.0/0,::/0
"""

    # Save client configuration
    home_dir = os.path.expanduser(f"~/{client_name}")
    os.makedirs(home_dir, exist_ok=True)
    client_config_path = os.path.join(home_dir, f"{client_name}.conf")
    with open(client_config_path, "w") as f:
        f.write(client_config)

    # Append the client to the server configuration
    server_peer_entry = f"""
### Client {client_name}
[Peer]
PublicKey = {client_pub_key}
PresharedKey = {client_pre_shared_key}
AllowedIPs = {client_wg_ipv4}/32,{client_wg_ipv6}/128
"""
    with open(wg_config_path, "a") as f:
        f.write(server_peer_entry)

    # Reload WireGuard configuration
    subprocess.run(["wg", "syncconf", "wg0", f"<(wg-quick strip wg0)"], shell=True, check=True)

    return {"message": f"Client configuration saved at: {client_config_path}"}

@app.delete("/vpn/users")
def delete_client(client_name, wg_config_path="/etc/wireguard/wg0.conf"):
    """
    Delete an existing WireGuard client.
    :param client_name: Name of the client to delete.
    :param wg_config_path: Path to the WireGuard server configuration file.
    """
    try:
        with open(wg_config_path, "r") as f:
            lines = f.readlines()

        # Find the client's peer entry
        client_found = False
        new_lines = []
        for line in lines:
            if line.startswith("### Client") and client_name in line:
                client_found = True
            elif client_found and line.startswith("[Peer]"):
                client_found = False
            elif not client_found:
                new_lines.append(line)

        if not new_lines:
            raise HTTPException(status_code=404, detail=f"Client '{client_name}' not found in the configuration.")

        # Save the updated configuration
        with open(wg_config_path, "w") as f:
            f.write("".join(new_lines))

        # Reload WireGuard configuration
        subprocess.run(["wg", "syncconf", "wg0", f"<(wg-quick strip wg0)"], shell=True, check=True)

        return {"message": f"Client '{client_name}' successfully deleted."}

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Configuration file not found at {wg_config_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post("/generate-qr")
async def generate_qr(file_path: str):
    try:
        # Parse the JSON request body
        with open(file_path, "r") as f:
            client_config = f.read()

        if not client_config:
            raise HTTPException(status_code=400, detail="client_config is required")

        # Generate the QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(client_config)
        qr.make(fit=True)

        # Create an image of the QR code
        img = qr.make_image(fill_color="black", back_color="white")

        # Save the QR code to a BytesIO stream
        img_io = BytesIO()
        img.save(img_io, format="PNG")
        img_io.seek(0)

        # Return the QR code image as a streaming response
        return StreamingResponse(
            img_io,
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=wg_client_qr.png"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8002)