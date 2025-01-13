from pydantic import BaseModel
from sqlalchemy import Boolean, Column, Integer, String
from db.base_class import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    password = Column(String(255))
    role = Column(String(255))
    trustscore = Column(Integer, default=0)
    location = Column(String(255))
    vpnconfig = Column(String(255))
    assets = Column(String(255))