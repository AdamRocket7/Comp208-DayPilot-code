import requests
from datetime import datetime, timedelta
from app.config import settings

def get_route(origin: str, destination: str, departure_time: str, arrive_early_minutes: int, mode: str, vibe: str):
    api_key = settings.geoapify_api_key
    url = "https://api.geoapify.com/v1/routing"

    params = {
        "waypoints": f"{origin}|{destination}",
        "mode": mode,  # drive, walk, bicycle
        "apiKey": api_key
    }

    response = requests.get(url, params=params)
    data = response.json()

    if "features" not in data:
        raise Exception(f"Geoapify routing error: {data}")

    route = data["features"][0]["properties"]

    duration_minutes = route["time"] // 60
    distance_km = route["distance"] / 1000

    dt = datetime.fromisoformat(departure_time.replace("Z", "+00:00"))
    adjusted_departure = dt - timedelta(minutes=arrive_early_minutes)

    return {
        "duration_minutes": duration_minutes,
        "distance_km": distance_km,
        "adjusted_departure_time": adjusted_departure.isoformat(),
        "vibe_used": vibe
    }