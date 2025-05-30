from typing import Optional
from datetime import datetime

from pydantic import BaseModel, EmailStr


# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    full_name: Optional[str] = None
    role: Optional[str] = None


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str


# Properties to receive via API on update
class UserUpdate(UserBase):
    location: Optional[str] = None
    trustscore: Optional[int] = 0
    assets: Optional[str] = None
    # password: Optional[str] = None


class UserInDBBase(UserBase):
    id: int
    location: Optional[str] = None
    trustscore: Optional[int] = 0
    assets: Optional[str] = None
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Additional properties to return via API
class User(UserInDBBase):
    pass


# Additional properties stored in DB
class UserInDB(UserInDBBase):
    password: str
