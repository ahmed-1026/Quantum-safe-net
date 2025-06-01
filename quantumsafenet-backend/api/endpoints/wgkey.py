from datetime import timedelta
from typing import Any, List
import textwrap

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse

import crud, models, schemas
from .. import deps
from core import security
from core.config import settings


router = APIRouter()

@router.post("", response_model=schemas.WGKeyInDB)
async def create_wgkey(
    wgkey_in: schemas.WGKeyCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new wg client
    """
    server = crud.server.get_by_id(db, id=wgkey_in.server_id)
    if server is None:
        raise HTTPException(status_code=400, detail="Server not found")
    # check if user has wgkey for this server
    wgkey = crud.wgkey.get_by_user_id_and_server_id(db, user_id=current_user.id, server_id=wgkey_in.server_id)
    if wgkey:
        raise HTTPException(status_code=400, detail="User already has a wgkey for this server")
    wgkey = await crud.wgkey.create(db, obj_in=wgkey_in, server=server, user_id = current_user.id)
    if not wgkey:
        raise HTTPException(status_code=400, detail="Failed to create wireguard key")
    return wgkey

@router.get("", response_model=List[schemas.WGKeyInDB])
def read_all_wgkeys(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all wg keys
    """
    wgkeys = crud.wgkey.get_multi(db)
    return wgkeys

@router.get("/{server_id}", response_model=schemas.ServerInDB)
def read_wgkey_by_server_id(
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
    if current_user.role != 'admin':
        wgkey = crud.wgkey.get_by_user_id_and_server_id(db, user_id=current_user.id, server_id=server_id)
        if wgkey is None:
            raise HTTPException(status_code=404, detail="wgkey not found")
    else:
        wgkey = crud.wgkey.get_by_server_id(db, server_id=server_id)
    if wgkey is None:
        raise HTTPException(status_code=404, detail="wgkey not found")
    return wgkey

@router.get("/{server_id}/config", response_model=schemas.ServerInDB)
def read_wg_config(
    server_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get user by ID
    """
    try:
        server = crud.server.get(db, id=server_id)
        if server is None:
            raise HTTPException(status_code=404, detail="server not found")
        wgkey = crud.wgkey.get_by_user_id_and_server_id(db, user_id=current_user.id, server_id=server_id)
        if wgkey is None:
            raise HTTPException(status_code=404, detail="wgkey not found")
        configuration = textwrap.dedent(f"""\
            [Interface]
            PrivateKey = {wgkey.private_key}
            Address = {wgkey.address}
            

            [Peer]
            PublicKey = {server.server_public_key}
            Endpoint = {server.server_ip}:{server.server_port}
            AllowedIPs = 0.0.0.0/0, ::/0
            """)
        return JSONResponse(content={"id": wgkey.id,"configuration": configuration})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get wg configuration: {str(e)}")

@router.put("/{wgkey_id}", response_model=schemas.WGKeyInDB)
def update_wgkey(
    wgkey_id: int,
    wgkey_in: schemas.WGKeyUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update wg key
    """
    role = current_user.role
    wgkey = crud.wgkey.get(db, id=wgkey_id)
    if wgkey is None:
        raise HTTPException(status_code=404, detail="Key not found")
    
    if wgkey.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="You are not authorized to update this wgkey")
    
    wgkey = crud.wgkey.update(db, db_obj=wgkey, obj_in=wgkey_in)
    return wgkey

@router.delete("/{wgkey_id}", response_model=schemas.WGKeyInDB)
def delete_user(
    wgkey_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete user
    """
    role = current_user.role
    wgkey = crud.wgkey.get(db, id=wgkey_id)
    if wgkey.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="You are not authorized to delete this wgkey")
    
    if wgkey is None:
        raise HTTPException(status_code=404, detail="Key not found")
    
    wgkey = crud.wgkey.remove(db, id=wgkey_id)
    return wgkey