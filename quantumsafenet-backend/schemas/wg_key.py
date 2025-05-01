from typing import Optional
from pydantic import BaseModel
from datetime import datetime



class WGKeyCreate(BaseModel):
    server_id: int

class WGKeyUpdate(BaseModel):
    user_id: Optional[int] = None
    server_id: Optional[int] = None
    is_active: Optional[bool] = None


class WGKeyInDB(BaseModel):
    id: int
    user_id: int
    public_key: str
    private_key: str
    pre_shared_key: str
    address: str
    server_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 