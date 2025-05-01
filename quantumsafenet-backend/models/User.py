from pydantic import BaseModel
from sqlalchemy import Boolean, Column, Integer, String, DateTime
from db.base_class import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


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
    assets = Column(String(255))

    wg_keys = relationship("WGKey", back_populates="user")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())