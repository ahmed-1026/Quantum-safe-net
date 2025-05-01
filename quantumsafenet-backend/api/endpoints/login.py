from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import crud, models, schemas
from .. import deps
from core import security
from core.config import settings


router = APIRouter()

@router.post("", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = crud.user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not crud.user.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    print(user.role)
    return {
        "access_token": security.create_access_token(
            str(user.id)+":"+str(user.email)+":"+str(user.password), 
        ),
        "token_type": "bearer",
        "role": user.role
    }


@router.post("/test-token", response_model=schemas.User)
def test_token(current_user: models.User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)) -> Any:
    """
    Test access token
    """
    return current_user
