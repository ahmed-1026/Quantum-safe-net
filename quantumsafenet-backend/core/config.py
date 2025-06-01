import secrets
import pathlib
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, EmailStr, HttpUrl, MySQLDsn, field_validator
from pydantic.main import BaseModel

class Settings(BaseModel):
    API_V1_STR: str = ""
    SECRET_KEY: str = secrets.token_urlsafe(32)
    # 60 minutes * 24 hours * 1 days = 1 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 1
    SERVER_NAME: str = 'localhost'
    SERVER_HOST: AnyHttpUrl = 'http://127.0.0.1'
    HOST_IP: str = '134.122.115.78'
    # BACKEND_CORS_ORIGINS is a JSON-formatted list of origins
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = ["*","http://localhost:8000"]
    BASE_PATH: str = str(pathlib.Path().absolute()) + '/quantumsafenet-backend'

    PROJECT_NAME: str = 'QuantumSafeNet'
    # SQLALCHEMY_DATABASE_URI: Optional[MySQLDsn] = "mysql+pymysql://ahmed:528082@localhost:3306/quantumsafenet"
    # SQLALCHEMY_DATABASE_URI: Optional[MySQLDsn] = "mysql+pymysql://appuser:strongpassword@localhost:3306/quantumsafenet"
    SQLALCHEMY_DATABASE_URI: Optional[MySQLDsn] = "sqlite:///./quantumsafenet.db"

    FIRST_SUPERUSER: EmailStr = "admin@qsn.com"
    FIRST_SUPERUSER_PASSWORD: str = '123'

    WIREGUARD_MANAGER_PORT: int = 8002
    WIREGUARD_MANAGER_URL: str = f'http://{HOST_IP}:8002'

    class Config:
        case_sensitive = True


settings = Settings()
