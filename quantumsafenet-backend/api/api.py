from fastapi import APIRouter
from .endpoints import login, account, user


api_router = APIRouter()
api_router.include_router(login.router, prefix="/login", tags=["auth"])
api_router.include_router(account.router, prefix="/account", tags=["account"])
api_router.include_router(user.router, prefix="/user", tags=["user"])