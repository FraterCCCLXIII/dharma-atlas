#!/usr/bin/env python3
"""Forward-geocode places with addresses; improve coord precision."""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib.place_utils import (
    GEOCODE_CACHE_PATH,
    is_suspicious_coord,
    load_places,
    save_places,
    USER_AGENT,
)

NOMINATIM_DELAY = 1.05
KML_FOLDERS = {
    "Insight, Theravada, Vipassanna",
    "Tibetan",
    "Zen, Chan, Son, & Thien,",
    "Other Buddhist Centers",
    "Vietnamese Temples",
    "Chinese Temple",
    "Thai, Burmese, Lao, Cambodian, and Sri Lankan Temple",
    "Pure Land, Soka Gakkai, Jodo Shin",
    "Won Buddhism",
}


def load_cache() -> dict:
    if GEOCODE_CACHE_PATH.exists():
        return json.loads(GEOCODE_CACHE_PATH.read_text())
    return {}


def save_cache(cache: dict) -> None:
    GEOCODE_CACHE_PATH.write_text(json.dumps(cache, indent=2) + "\n")


def geocode(
    query: str,
    cache: dict,
    allow_api: bool,
    country_code: str = "",
) -> tuple[float, float] | None:
    key = query.strip().lower()
    if not key:
        return None
    cached = cache.get(key)
    if cached and cached.get("lat") is not None and cached.get("lng") is not None:
        return cached["lat"], cached["lng"]
    if not allow_api:
        return None

    params: dict[str, str] = {
        "q": query,
        "format": "json",
        "limit": "1",
        "addressdetails": "0",
    }
    if country_code:
        params["countrycodes"] = country_code

    url = f"https://nominatim.openstreetmap.org/search?{urllib.parse.urlencode(params)}"
    time.sleep(NOMINATIM_DELAY)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read())
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        cache[key] = {"lat": None, "lng": None, "failed": True}
        return None

    if not data:
        cache[key] = {"lat": None, "lng": None, "failed": True}
        return None

    lat = round(float(data[0]["lat"]), 6)
    lng = round(float(data[0]["lon"]), 6)
    cache[key] = {"lat": lat, "lng": lng}
    return lat, lng


def country_from_folder(folder: str) -> str:
    import re

    match = re.search(r"\(([^)]+)\)$", folder)
    if not match:
        return ""
    name = match.group(1).strip().lower()
    mapping = {
        "united states of america": "us",
        "usa": "us",
        "canada": "ca",
        "united kingdom": "gb",
        "australia": "au",
        "india": "in",
        "france": "fr",
        "germany": "de",
    }
    return mapping.get(name, "")


def geocode_query(place: dict) -> str | None:
    address = (place.get("address") or "").strip()
    name = place.get("name", "")
    folder = place.get("folder", "")

    if folder in KML_FOLDERS:
        return None

    if address and len(address) > 12:
        return f"{address}"
    if folder.startswith("Goenka Vipassana") and address:
        return f"{name}, {address}"
    if folder.startswith("BuddhaNet") and address:
        return f"{name}, {address}"
    return None


def main() -> None:
    parser = argparse.ArgumentParser(description="Re-geocode places with full addresses")
    parser.add_argument("--no-api", action="store_true", help="Use cache only")
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()
    allow_api = not args.no_api

    payload, places = load_places()
    cache = load_cache()
    updated = 0
    skipped = 0

    targets = [
        p
        for p in places
        if geocode_query(p)
        and (
            is_suspicious_coord(p["lat"], p["lng"])
            or p.get("coordPrecision") in ("region", "city", "unknown")
        )
    ]

    if args.limit:
        targets = targets[:args.limit]

    print(f"Re-geocoding {len(targets)} places (allow_api={allow_api})")

    for idx, place in enumerate(targets, start=1):
        query = geocode_query(place)
        if not query:
            skipped += 1
            continue

        cc = country_from_folder(place.get("folder", ""))
        coords = geocode(query, cache, allow_api, cc)
        if not coords:
            skipped += 1
            continue

        lat, lng = coords
        place["lat"] = lat
        place["lng"] = lng
        place["coordPrecision"] = "address"
        flags = set(place.get("qualityFlags") or [])
        flags.discard("stacked_coords")
        place["qualityFlags"] = list(flags)
        updated += 1

        if idx % 25 == 0:
            save_cache(cache)
            save_places(payload, places)
            print(f"  {idx}/{len(targets)} — updated {updated}", flush=True)

    save_cache(cache)
    save_places(payload, places)
    print(f"Done: updated {updated}, skipped {skipped}")


if __name__ == "__main__":
    main()
