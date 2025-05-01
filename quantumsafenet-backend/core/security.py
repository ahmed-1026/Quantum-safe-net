from datetime import datetime, timedelta
from typing import Any, Union

from jose import jwt
from passlib.context import CryptContext

from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


ALGORITHM = "HS256"


def create_access_token(
    subject: Union[str, Any]
) -> str:
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

import subprocess


def get_pub_private_key_pair():
    """
    Generate a public/private key pair for WireGuard.
    :return: Tuple of (private_key, public_key).
    """
    private_key = subprocess.check_output(
        ["wg", "genkey"], text=True
    ).strip()
    public_key = subprocess.check_output(
        ["wg", "pubkey"], input=private_key, text=True
    ).strip()
    return private_key, public_key