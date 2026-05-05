# app/schemas.py
from datetime import datetime
from typing import Optional, List, Literal

from pydantic import BaseModel


# ROUTING
class RouteRequest(BaseModel):
    origin: str  # "lat,lng" or address
    destination: str  # "lat,lng" or address
    departure_time: datetime
    arrive_early_minutes: int = 5
    mode: Literal["walking", "driving", "transit", "bicycling"] = "walking"
    vibe: Literal["efficient", "romantic", "scenic"] = "efficient"


class RouteResponse(BaseModel):
    duration_minutes: int
    distance_km: float
    polyline: Optional[str] = None
    adjusted_departure_time: datetime


# EVENTS
class EventBase(BaseModel):
    title: str
    location: str
    start_time: datetime
    duration_minutes: int
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None

    notifications_enabled: bool = False
    reminder_minutes_before: int = 30


class EventCreate(EventBase):
    pass


class Event(EventBase):
    id: int

    class Config:
        orm_mode = True


# GAPS
class Gap(BaseModel):
    start_time: datetime
    end_time: datetime
    duration_minutes: int


class UserPreferences(BaseModel):
    meal_themes: List[str] = []
    max_walk_minutes: int = 20
    sponsored_weight: float = 0.5 #default


class Recommendation(BaseModel):
    type: Optional[str] = "restaurant"
    name: str
    address: str
    lat: float
    lng: float
    location: str
    rating: float
    distance_minutes: int | None = None
    feasible: bool
    sponsor_boost: float
    score: float


class RecommendationResponse(BaseModel):
    recommendations: List[Recommendation]
    map_url: str



#not used due to localhost
class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SearchHistoryOut(BaseModel):
    place_name: str
    timestamp: datetime

    class Config:
        orm_mode = True
