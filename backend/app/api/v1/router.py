from fastapi import APIRouter

from app.api.v1 import auth, persons, profession_groups

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(profession_groups.router)
api_router.include_router(persons.router)
