from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base_class import Base


class WGKey(Base):
    __tablename__ = "wg_keys"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    public_key = Column(String(255), index=True)
    private_key = Column(String(255), index=True)
    pre_shared_key = Column(String(255), index=True)
    address = Column(String(255), index=True)
    is_active = Column(Boolean, default=True)
    user = relationship("User", back_populates="wg_keys")
    server_id = Column(Integer, ForeignKey("servers.id"))
    server = relationship("Server", back_populates="wg_keys")

    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())