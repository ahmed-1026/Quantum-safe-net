from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base_class import Base

class Server(Base):
    __tablename__ = "servers"
    id = Column(Integer, primary_key=True, index=True)
    server_name = Column(String(255), unique=True, index=True)
    server_ip = Column(String(255), unique=True, index=True)
    server_port = Column(Integer, default=51820)
    server_location = Column(String(255), nullable=True)
    server_public_key = Column(String(255), unique=True, index=True)
    server_private_key = Column(String(255), unique=True, index=True)
    server_pre_shared_key = Column(String(255), unique=True, index=True)
    subnet = Column(String(255), index=True)
    interface = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    last_used_ip = Column(String(255), nullable=True)
    wg_keys = relationship("WGKey", back_populates="server")

    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())