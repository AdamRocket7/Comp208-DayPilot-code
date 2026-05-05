# app/routers/navigation.py
from fastapi import APIRouter
from app.schemas import RouteRequest, RouteResponse
from app.services.navigation_services import get_route

router = APIRouter(prefix="/navigation", tags=["navigation"])


@router.post("/route", response_model=RouteResponse)
def route(req: RouteRequest):
    return get_route(req)
