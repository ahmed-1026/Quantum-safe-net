from datetime import timedelta
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import crud, models, schemas
from .. import deps
from core import security
from core.config import settings


router = APIRouter()

@router.post("", response_model=schemas.User)
def create_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new user
    """
    role = current_user.role
    if role != 'admin':
        raise HTTPException(status_code=400, detail="You are not authorized to create new users")
    
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.user.create(db, obj_in=user_in)
    return user

@router.get("", response_model=List[schemas.User])
def read_all_users(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all users
    """
    role = current_user.role
    if role != 'admin':
        raise HTTPException(status_code=400, detail="You are not authorized to view all users")
    
    users = crud.user.get_multi(db)
    print("users", users)
    return users

@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get user by ID
    """
    role = current_user.role
    if role != 'admin':
        raise HTTPException(status_code=400, detail="You are not authorized to view user details")
    
    user = crud.user.get(db, id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user_in: schemas.UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update user
    """
    role = current_user.role
    if role != 'admin':
        raise HTTPException(status_code=400, detail="You are not authorized to update user details")
    
    user = crud.user.get(db, id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user = crud.user.update(db, db_obj=user, obj_in=user_in)
    return user

@router.delete("/{user_id}", response_model=schemas.User)
def delete_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete user
    """
    role = current_user.role
    if role != 'admin':
        raise HTTPException(status_code=400, detail="You are not authorized to delete users")
    
    user = crud.user.get(db, id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = crud.user.remove(db, id=user_id)
    return user