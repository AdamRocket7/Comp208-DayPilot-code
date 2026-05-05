import requests
from app.config import settings
from typing import List
from app.schemas import Gap, UserPreferences, Recommendation

def fetch_nearby_places(
    gap: Gap, user_prefs: UserPreferences, user_location: str
) -> List[Recommendation]:

    lat, lon = map(float, user_location.split(","))

    url = "https://api.geoapify.com/v2/places"
    params = {
        "categories": "catering.restaurant",  # restaurants
        "filter": f"circle:{lon},{lat},{user_prefs.max_walk_minutes * 80}",  
        "limit": 20,
        "apiKey": settings.geoapify_api_key
    }

    response = requests.get(url, params=params)
    data = response.json()

    if "features" not in data:
        return []

    results: List[Recommendation] = []

    for feature in data["features"]:
        props = feature["properties"]

        name = props.get("name")
        address = props.get("formatted")
        place_lat = props.get("lat")
        place_lon = props.get("lon")
        rating = props.get("rating", 3.0) #in case, it doesnt have any
        theme = props.get("cuisine", ["Unknown"])[0]

        travel_each_way = 10
        meal_time = 30
        total_needed = travel_each_way * 2 + meal_time
        feasible = total_needed <= gap.duration_minutes

        if user_prefs.meal_themes and theme not in user_prefs.meal_themes:
            continue

        distance_minutes = travel_each_way
        sponsor_boost = 0.0

        preference_score = 1.0 if theme in user_prefs.meal_themes else 0.5
        distance_score = max(0, 1.0 - distance_minutes / user_prefs.max_walk_minutes)
        feasibility_score = 1.0 if feasible else 0.0
        rating_score = rating / 5.0

        score = (
            preference_score
            + distance_score
            + feasibility_score
            + rating_score
            + sponsor_boost
        )

        results.append(
            Recommendation(
                name=name,
                address=address,
                lat=place_lat,
                lng=place_lon,
                rating=rating,
                distance_minutes=distance_minutes,
                feasible=feasible,
                sponsor_boost=sponsor_boost,
                score=score,
            )
        )

    return sorted(results, key=lambda r: r.score, reverse=True)