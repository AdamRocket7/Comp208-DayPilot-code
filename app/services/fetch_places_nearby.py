import requests
from app.schemas import Recommendation
from app.config import settings
import random


def get_nearby_places(lat, lon, prefs):
    cuisine_filter = ""
    if prefs.meal_themes:
        cuisine = prefs.meal_themes[0].lower()
        cuisine_filter = f"&filter=cuisine:{cuisine}"

    url = (
        "https://api.geoapify.com/v2/places?"
        "categories=catering.restaurant"
        f"{cuisine_filter}"
        f"&bias=proximity:{lon},{lat}"
        f"&limit=20"
        f"&apiKey={settings.geoapify_api_key}"
    )

    res = requests.get(url)
    data = res.json()

    places = []
    for f in data.get("features", []):
        props = f["properties"]
        geom = f.get("geometry", {}).get("coordinates")

        # Skip places with missing or invalid coordinates
        if not geom or geom[0] is None or geom[1] is None:
            continue

        places.append(
            Recommendation(
                type="restaurant",
                name=props.get("name", "Unknown"),
                address=props.get("formatted", ""),
                lat=geom[1],
                lng=geom[0],
                location=props.get("address_line1", ""),
                rating=props.get("rating", 4.0),
                distance_minutes=None,
                feasible=False,
                sponsor_boost=0.0,
                score=1.0,
            )
        )


    return places


def get_route(user_lat, user_lon, place_lat, place_lon):
    url = (
        "https://api.geoapify.com/v1/routing?"
        f"waypoints={user_lat},{user_lon}|{place_lat},{place_lon}"
        f"&mode=walk"
        f"&apiKey={settings.geoapify_api_key}"
    )

    res = requests.get(url)
    data = res.json()

    try:
        return data["features"][0]["properties"]["time"] // 60
    except:
        return None


def generate_static_map(lat, lon, places):
    base = "https://maps.geoapify.com/v1/staticmap"

    markers = [
        f"lonlat:{lon},{lat};color:%23ff0000;size:large"
    ]

    for p in places:
        markers.append(
            f"lonlat:{p.lng},{p.lat};color:%2300aaff;size:medium"
        )

    marker_str = "|".join(markers)

    return (
        f"{base}?style=osm-carto&width=600&height=400"
        f"&marker={marker_str}&apiKey={settings.geoapify_api_key}"
    )


def fetch_places_nearby(gap, prefs, user_location):
    lat_str, lon_str = user_location.split(",")
    user_lat = float(lat_str)
    user_lon = float(lon_str)

    places = get_nearby_places(user_lat, user_lon, prefs)

    #+ walking time 
    for p in places:
        p.distance_minutes = get_route(user_lat, user_lon, p.lat, p.lng)
        p.feasible = (
            p.distance_minutes is not None
            and p.distance_minutes <= prefs.max_walk_minutes
        )
    sponsor_weight = prefs.sponsored_weight

    for p in places:
        is_sponsored = random.random() < sponsor_weight
        p.sponsor_boost = 1.0 if is_sponsored else 0.0

    map_url = generate_static_map(user_lat, user_lon, places)

    return {
        "recommendations": places,
        "map_url": map_url
    }
