from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ServerCreate(BaseModel):
    server_name: str
    server_ip: str
    server_port: Optional[int] = 51820
    is_active: Optional[bool] = True

class ServerUpdate(BaseModel):
    server_name: Optional[str] = None
    server_ip: Optional[str] = None
    server_port: Optional[int] = None
    server_location: Optional[str] = None
    server_public_key: Optional[str] = None
    server_private_key: Optional[str] = None
    server_pre_shared_key: Optional[str] = None
    subnet: Optional[str] = None
    interface: Optional[str] = None
    is_active: Optional[bool] = None
    last_used_ip: Optional[str] = None


class ServerInDB(BaseModel):
    id: int
    server_name: str
    server_ip: str
    server_port: int
    server_location: Optional[str] = None
    server_public_key: str
    server_private_key: str
    server_pre_shared_key: str
    subnet: str
    interface: Optional[str] = None
    is_active: bool
    last_used_ip: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
