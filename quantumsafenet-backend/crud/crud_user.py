from typing import Any, Dict, Optional, Union
import requests
from sqlalchemy.orm import Session

from core.security import get_password_hash, verify_password
from core.config import settings
from .base import CRUDBase
from models import User
from schemas.user import UserCreate, UserUpdate


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        wg_manager_url = settings.WIREGUARD_MANAGER_URL
        response = requests.post(
            f"{wg_manager_url}/vpn/users",
            params={
            "client_name": obj_in.full_name,
            "wg_config_path": "/etc/wireguard/wg0.conf",
            "server_pub_ip": "192.168.1.1",
            "server_port": 51820,
            "dns": ["1.1.1.1", "1.0.0.1"]
            },
            headers={"accept": "application/json"},
            data={}
        )
        if response.status_code != 200:
            raise Exception(f"Failed to create VPN user: {response.text}")
        else:
            config_path = response.json()["message"].split(": ")[1]
        db_obj = User(
            email=obj_in.email,
            password=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
            role=obj_in.role,
            vpnconfig=config_path
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        if update_data["password"]:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["password"] = hashed_password
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.password):
            return None
        return user

    def is_active(self, user: User) -> bool:
        return user.is_active
    
    def remove(self, db, *, id):
        user = self.get(db, id=id)
        wg_manager_url = settings.WIREGUARD_MANAGER_URL
        response = requests.delete(
            f"{wg_manager_url}/vpn/users",
            params={
            "client_name": user.full_name,
            "wg_config_path": user.vpnconfig
            },
            headers={"accept": "application/json"},
            data={}
        )
        if response.status_code != 200:
            raise Exception(f"Failed to delete user: {response.text}")
        return super().remove(db, id=id)



user = CRUDUser(User)
