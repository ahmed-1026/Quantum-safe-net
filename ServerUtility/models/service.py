from typing import Dict


class Service:
    type: str
    name: str
    port: int
    exe: str
    OPENVPN = "openvpn"
    XRAY = "xray"
    OPENCONNECT = "ocserv"
    WIREGUARD = "wireguard"
    SHADOWSOCKS = "shadowsocks"
    def __init__(self, type: str, name: str, port: int = 0, exe: str = "") -> None:
        self.type = type
        self.name = name
        self.port = port
        self.exe = exe

    @classmethod
    def from_json(cls, json_data: Dict) -> 'Service':
        return cls(
            type=json_data['type'],
            name=json_data['name'],
            port=json_data.get('port', 0),
            exe=json_data.get('exe', "")
        )
