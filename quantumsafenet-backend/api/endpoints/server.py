from datetime import timedelta
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import crud, models, schemas
from .. import deps
from api.socket_server import send_message
from core import security
from core.config import settings


router = APIRouter()

@router.post("", response_model=schemas.ServerInDB)
def create_server(
    user_in: schemas.ServerCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new server
    """
    role = current_user.role
    if role != 'admin':
        raise HTTPException(status_code=400, detail="You are not authorized to create new servers")
    
    server = crud.server.get_by_name(db, server_name=user_in.server_name)
    server_ip = crud.server.get_by_ip(db, server_ip=user_in.server_ip)
    if server or server_ip:
        raise HTTPException(status_code=400, detail="Server already registered")
    print(f"Creating server: {user_in.server_name}")
    server = crud.server.create(db, obj_in=user_in)
    return server

@router.get("", response_model=List[schemas.ServerInDB])
def read_all_servers(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all servers
    """
    servers = crud.server.get_multi(db)
    return servers

@router.get("/{server_id}", response_model=schemas.ServerInDB)
def read_server_by_id(
    server_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get user by ID
    """
    
    server = crud.server.get(db, id=server_id)
    if server is None:
        raise HTTPException(status_code=404, detail="server not found")
    return server

@router.post("/{server_id}/start", response_model=schemas.ServerInDB)
async def start_server(
    server_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Start server
    """
    role = current_user.role
    if role != 'admin':
        raise HTTPException(status_code=400, detail="You are not authorized to start servers")
    
    server = crud.server.get(db, id=server_id)
    if server is None:
        raise HTTPException(status_code=404, detail="Server not found")
    
    await send_message(
        server.server_ip,
        "initialize",
        {
            "server_ip": server.server_ip,
            "SERVER_PRIV_KEY": server.server_private_key,
            "SERVER_PUB_KEY": server.server_public_key
        }
    )
    return server

@router.put("/{server_id}", response_model=schemas.ServerInDB)
def update_server(
    server_id: int,
    server_in: schemas.ServerUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update server
    """
    role = current_user.role
    if role != 'admin':
        raise HTTPException(status_code=400, detail="You are not authorized to edit servers")
    
    server = crud.server.get(db, id=server_id)
    if server is None:
        raise HTTPException(status_code=404, detail="Server not found")
    server = crud.server.update(db, db_obj=server, obj_in=server_in)
    return server

@router.delete("/{server_id}", response_model=schemas.ServerInDB)
def delete_server(
    server_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete server
    """
    role = current_user.role
    if role != 'admin':
        raise HTTPException(status_code=400, detail="You are not authorized to delete servers")
    
    server = crud.server.get(db, id=server_id)
    if server is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    server = crud.server.remove(db, id=server_id)
    return server