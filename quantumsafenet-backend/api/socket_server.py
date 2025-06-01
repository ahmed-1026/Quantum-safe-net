import socketio


sio=socketio.AsyncServer(cors_allowed_origins='*',async_mode='asgi')
socket_app = socketio.ASGIApp(sio)
connected_clients = {}

@sio.on("connect")
async def connect(sid, environ, *args, **kwargs):
    client_host, client_port = environ['asgi.scope']['client']
    print(f"Client connected from {client_host}:{client_port}")
    connected_clients[client_host] = sid

@sio.on("disconnect")
async def disconnect(sid):
    print("Client Disconnected: "+" "+str(sid))

async def send_message(ip, type, message):
    try:
        if ip in connected_clients:
            sid = connected_clients[ip]
            await sio.emit(type, message, room=sid)
            print(f"Message sent to {ip}: {message}")
            return True
        else:
            print(f"Client {ip} not connected")
            return False
    except Exception as e:
        print(f"Error sending message to {ip}: {e}")
        return False