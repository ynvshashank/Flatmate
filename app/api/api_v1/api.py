from fastapi import APIRouter
from .endpoints import auth, houses, tasks

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(houses.router, prefix="/houses", tags=["houses"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
