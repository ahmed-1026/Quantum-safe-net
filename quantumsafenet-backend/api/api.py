from fastapi import APIRouter
from .endpoints import login, account, user, server, wgkey


api_router = APIRouter()
api_router.include_router(login.router, prefix="/login", tags=["auth"])
api_router.include_router(account.router, prefix="/account", tags=["account"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(server.router, prefix="/server", tags=["server"])
api_router.include_router(wgkey.router, prefix="/wgkey", tags=["wgkey"])