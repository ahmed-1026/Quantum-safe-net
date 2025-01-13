from fastapi import APIRouter
from .endpoints import login, account


api_router = APIRouter()
api_router.include_router(login.router, prefix="/login")
api_router.include_router(account.router, prefix="/account", tags=["admin"])