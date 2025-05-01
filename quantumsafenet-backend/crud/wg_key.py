from typing import Any, Dict, Optional, Union
from sqlalchemy.orm import Session
import subprocess, requests

from .base import CRUDBase
from models import WGKey, Server
from schemas import WGKeyCreate, WGKeyUpdate
from core.config import settings
from core.security import get_pub_private_key_pair
from api.socket_server import send_message


class CRUDWGKey(CRUDBase[WGKey, WGKeyCreate, WGKeyUpdate]):
    def get_by_public_key(self, db: Session, *, public_key: str) -> Optional[WGKey]:
        return db.query(WGKey).filter(WGKey.public_key == public_key).first()
    
    def get_by_user_id(self, db: Session, *, user_id: int) -> Optional[WGKey]:
        return db.query(WGKey).filter(WGKey.user_id == user_id).first()
    
    def get_by_server_id(self, db: Session, *, server_id: int) -> Optional[WGKey]:
        return db.query(WGKey).filter(WGKey.server_id == server_id).first()
    
    def get_by_user_id_and_server_id(self, db: Session, *, user_id: int, server_id: int) -> Optional[WGKey]:
        return db.query(WGKey).filter(
            WGKey.user_id == user_id,
            WGKey.server_id == server_id
        ).first()

    async def create(self, db: Session, *, obj_in: WGKeyCreate, server: Server, user_id) -> WGKey:
        # check if user has keys
        wgkey = self.get_by_user_id(db, user_id=user_id)
        if wgkey:
            client_private_key = wgkey.private_key
            client_public_key = wgkey.public_key
        else:
            # Generate private and public keys
            client_private_key, client_public_key = get_pub_private_key_pair()
        last_used_ip = server.last_used_ip
        # Find an available IPv4 address
        client_ip = last_used_ip.split(".")
        client_ip[-1] = str(int(client_ip[-1]) + 1)
        client_ip = ".".join(client_ip)
        server.last_used_ip = client_ip
        # add to wireguard server
        await send_message(server.server_ip, "add-client", {
            "interface": server.interface,
            "client_public_key": client_public_key,
            "allowed_ips": "0.0.0.0/0"
        })
        db_obj = WGKey(
            user_id=user_id,
            server_id=obj_in.server_id,
            public_key=client_public_key,
            private_key=client_private_key,
            pre_shared_key="pre-shared key placeholder"+client_ip,
            address=client_ip,
            is_active=True,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        db.refresh(server)
        return db_obj

    def update(
        self, db: Session, *, db_obj: WGKey, obj_in: Union[WGKeyUpdate, Dict[str, Any]]
    ) -> WGKey:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def remove(self, db: Session, *, id: int) -> WGKey:
        return super().remove(db, id=id)


wgkey = CRUDWGKey(WGKey)
