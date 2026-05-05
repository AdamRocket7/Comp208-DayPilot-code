from fastapi import APIRouter
from datetime import datetime

from app.schemas import Gap, UserPreferences, RecommendationResponse
from app.services.fetch_places_nearby import fetch_places_nearby


router = APIRouter()


class RecommendationRequest(UserPreferences):
    gap_start: datetime
    gap_end: datetime
    user_location: str


@router.post("/", response_model=RecommendationResponse)
def get_recommendations(req: RecommendationRequest):
    # Calculate gap duration
    duration = int((req.gap_end - req.gap_start).total_seconds() // 60)

    gap = Gap(
        start_time=req.gap_start,
        end_time=req.gap_end,
        duration_minutes=duration,
    )

    # Call your service
    result = fetch_places_nearby(
        gap=gap,
        prefs=req,
        user_location=req.user_location
    )

    # Return structured response
    return RecommendationResponse(**result)

