from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

import crud, models, schemas
from core import security
from core.config import settings
from db.session import SessionLocal

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/login"
)


def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def get_current_user_id(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> int:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    return token_data.sub

def get_current_user(
    db: Session = Depends(get_db), 
    data : str = Depends(get_current_user_id)
) -> models.User:
    cred = data.split(sep=':', maxsplit=3)
    user = crud.user.get(db, id=cred[0])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not crud.user.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    if not (user.email == cred[1] and user.password == cred[2]):
        raise HTTPException(status_code=404, detail="User not found")
    return user