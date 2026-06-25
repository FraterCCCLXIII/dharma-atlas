#!/usr/bin/env python3
"""Enrich places.json with address, phone, and website via OSM/Nominatim."""

from __future__ import annotations

import json
import math
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLACES_PATH = ROOT / "src/data/places.json"
CACHE_PATH = ROOT / "scripts/enrich-cache.json"
USER_AGENT = "DharmaStreams/1.0 (contact enrichment; local dev)"

NOMINATIM_DELAY = 1.1
OVERPASS_DELAY = 0.5


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def fetch_json(url: str, data: bytes | None = None, timeout: int = 30) -> dict | list:
    req = urllib.request.Request(
        url,
        data=data,
        headers={"User-Agent": USER_AGENT},
        method="POST" if data else "GET",
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read())


def format_address(rev: dict) -> str:
    address = rev.get("address") or {}
    line_parts: list[str] = []

    house = address.get("house_number")
    road = address.get("road")
    if house and road:
        line_parts.append(f"{house} {road}")
    elif road:
        line_parts.append(road)

    city = (
        address.get("city")
        or address.get("town")
        or address.get("village")
        or address.get("hamlet")
        or address.get("municipality")
    )
    state = address.get("state")
    postcode = address.get("postcode")

    locality = ", ".join(p for p in [city, state, postcode] if p)
    if locality:
        line_parts.append(locality)

    if line_parts:
        return ", ".join(line_parts)

    display = rev.get("display_name", "")
    if display:
        parts = [p.strip() for p in display.split(",")]
        return ", ".join(parts[:4])
    return ""


def reverse_geocode(lat: float, lng: float) -> str:
    params = urllib.parse.urlencode(
        {
            "lat": lat,
            "lon": lng,
            "format": "json",
            "addressdetails": 1,
            "zoom": 18,
        }
    )
    url = f"https://nominatim.openstreetmap.org/reverse?{params}"
    data = fetch_json(url)
    return format_address(data)


def overpass_contact(lat: float, lng: float, name: str) -> tuple[str | None, str | None]:
    query = f"""
    [out:json][timeout:25];
    (
      node(around:600,{lat},{lng})["amenity"~"place_of_worship|monastery"];
      way(around:600,{lat},{lng})["amenity"~"place_of_worship|monastery"];
      relation(around:600,{lat},{lng})["amenity"~"place_of_worship|monastery"];
      node(around:600,{lat},{lng})["religion"="buddhist"];
      way(around:600,{lat},{lng})["religion"="buddhist"];
      relation(around:600,{lat},{lng})["religion"="buddhist"];
    );
    out tags center;
    """
    encoded = urllib.parse.urlencode({"data": query}).encode()
    try:
        payload = fetch_json("https://overpass-api.de/api/interpreter", data=encoded)
    except urllib.error.HTTPError:
        return None, None

    elements = payload.get("elements", [])
    if not elements:
        return None, None

    best_phone = None
    best_website = None
    best_score = -1.0
    name_lower = name.lower()

    for element in elements:
        tags = element.get("tags") or {}
        el_lat = element.get("lat") or (element.get("center") or {}).get("lat")
        el_lng = element.get("lon") or (element.get("center") or {}).get("lon")
        if el_lat is None or el_lng is None:
            continue

        dist = haversine_km(lat, lng, el_lat, el_lng)
        score = max(0.0, 1.0 - dist / 0.6)
        tag_name = (tags.get("name") or "").lower()
        if tag_name and (name_lower in tag_name or tag_name in name_lower):
            score += 2.0
        if tags.get("phone") or tags.get("contact:phone"):
            score += 1.5
        if tags.get("website") or tags.get("contact:website"):
            score += 1.5

        if score > best_score:
            best_score = score
            best_phone = tags.get("phone") or tags.get("contact:phone")
            best_website = tags.get("website") or tags.get("contact:website")

    return normalize_phone(best_phone), normalize_website(best_website)


def normalize_phone(value: str | None) -> str | None:
    if not value:
        return None
    cleaned = value.strip()
    return cleaned or None


def normalize_website(value: str | None) -> str | None:
    if not value:
        return None
    url = value.strip()
    if not url:
        return None
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    return url


def load_cache() -> dict:
    if CACHE_PATH.exists():
        return json.loads(CACHE_PATH.read_text())
    return {}


def save_cache(cache: dict) -> None:
    CACHE_PATH.write_text(json.dumps(cache, indent=2))


def enrich_place(place: dict, cache: dict) -> dict:
    key = place["id"]
    if key in cache:
        cached = cache[key]
        return {**place, **cached}

    lat, lng = place["lat"], place["lng"]
    address = reverse_geocode(lat, lng)
    time.sleep(NOMINATIM_DELAY)

    phone, website = overpass_contact(lat, lng, place["name"])
    time.sleep(OVERPASS_DELAY)

    enriched = {
        "address": address or "",
        "phone": phone,
        "website": website,
    }
    cache[key] = enriched
    save_cache(cache)
    return {**place, **enriched}


def main() -> None:
    payload = json.loads(PLACES_PATH.read_text())
    places = payload["places"]
    cache = load_cache()
    total = len(places)

    for index, place in enumerate(places, start=1):
        places[index - 1] = enrich_place(place, cache)
        if index % 5 == 0 or index == total:
            payload["places"] = places
            PLACES_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
            print(f"Enriched {index}/{total}", flush=True)

    with_phone = sum(1 for p in places if p.get("phone"))
    with_website = sum(1 for p in places if p.get("website"))
    with_address = sum(1 for p in places if p.get("address"))
    print(f"Done. address={with_address} phone={with_phone} website={with_website}")


if __name__ == "__main__":
    main()
