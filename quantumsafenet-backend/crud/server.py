from typing import Any, Dict, Optional, Union
from sqlalchemy.orm import Session
import requests
import subprocess

from .base import CRUDBase
from core.security import get_pub_private_key_pair
from models import Server
from schemas import ServerCreate, ServerUpdate
from core.config import settings


class CRUDServer(CRUDBase[Server, ServerCreate, ServerUpdate]):
    def get_by_name(self, db: Session, *, server_name: str) -> Optional[Server]:
        return db.query(Server).filter(Server.server_name == server_name).first()
    
    def get_by_ip(self, db: Session, *, server_ip: str) -> Optional[Server]:
        return db.query(Server).filter(Server.server_ip == server_ip).first()
    
    def get_by_id(self, db: Session, *, id: int) -> Optional[Server]:
        return db.query(Server).filter(Server.id == id).first()

    def create(self, db: Session, *, obj_in: ServerCreate) -> Server:
        # Generate private and public keys
        server_private_key, server_public_key = get_pub_private_key_pair()

        db_obj = Server(
            server_name=obj_in.server_name,
            server_ip=obj_in.server_ip,
            server_port=obj_in.server_port,
            server_location="USA",
            server_public_key=server_public_key,
            server_private_key=server_private_key,
            server_pre_shared_key="pre-shared key placeholder"+obj_in.server_ip,
            subnet="10.0.0/24",
            interface="wg0",
            is_active=obj_in.is_active,
            last_used_ip="10.0.0.1"
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: Server, obj_in: Union[ServerUpdate, Dict[str, Any]]
    ) -> Server:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def remove(self, db: Session, *, id: int) -> Server:
        return super().remove(db, id=id)
    
    def initialize_wireguard(self, db: Session, *, server: Server) -> None:
        """
        Initialize WireGuard configuration for the server.
        :param server: Server object to initialize.
        """

        try:
            response = requests.post(
                f"http://{server.server_ip}:{settings.WIREGUARD_MANAGER_PORT}/vpn/setup",
                params={
                    "server_ip": server.server_ip,
                    "SERVER_PRIV_KEY": server.server_private_key,
                    "SERVER_PUB_KEY": server.server_public_key
                },
                headers={"accept": "application/json"},
                data={}
            )
            print(f"Response: {response.text}")
            if response.status_code != 200:
                return False
            print("WireGuard server setup successfully.")
            return True
        except requests.RequestException as e:
            print(f"Failed to set up WireGuard: {e}")
            return False

server = CRUDServer(Server)
