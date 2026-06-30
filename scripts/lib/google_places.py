#!/usr/bin/env python3
"""Google Places API (New) client for place enrichment."""

from __future__ import annotations

import json
import math
import os
import time
import urllib.error
import urllib.parse
import urllib.request
import http.client
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from lib.place_utils import USER_AGENT, is_bad_website

ROOT = Path(__file__).resolve().parent.parent.parent
CACHE_PATH = ROOT / "scripts/google-places-cache.json"
PHOTOS_DIR = ROOT / "public/places"
ENV_PATH = ROOT / ".env.local"


def _load_env_file() -> None:
    if not ENV_PATH.exists():
        return
    for line in ENV_PATH.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_env_file()

SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
NEARBY_SEARCH_URL = "https://places.googleapis.com/v1/places:searchNearby"
REQUEST_DELAY = 0.25
PAGE_TOKEN_DELAY = 1.5
MAX_PAGES_PER_QUERY = 3  # Google Text Search caps at ~60 results per query
NEARBY_MAX_RESULTS = 20  # Nearby Search has no pagination

# Enterprise + Atmosphere SKU — website, phone, hours, description summaries, photos metadata
FIELD_MASK = ",".join(
    [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.shortFormattedAddress",
        "places.location",
        "places.nationalPhoneNumber",
        "places.internationalPhoneNumber",
        "places.websiteUri",
        "places.regularOpeningHours",
        "places.googleMapsUri",
        "places.photos",
        "places.editorialSummary",
        "places.generativeSummary",
        "places.rating",
        "places.userRatingCount",
        "places.businessStatus",
        "places.primaryType",
    ]
)

DISCOVERY_FIELD_MASK = ",".join(
    [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.shortFormattedAddress",
        "places.location",
        "places.nationalPhoneNumber",
        "places.internationalPhoneNumber",
        "places.websiteUri",
        "places.regularOpeningHours",
        "places.googleMapsUri",
        "places.editorialSummary",
        "places.generativeSummary",
        "places.rating",
        "places.userRatingCount",
        "places.businessStatus",
        "places.primaryType",
        "nextPageToken",
    ]
)

# Nearby Search has no pagination — nextPageToken in the field mask causes HTTP 400.
NEARBY_DISCOVERY_FIELD_MASK = ",".join(
    field for field in DISCOVERY_FIELD_MASK.split(",") if field != "nextPageToken"
)


def bbox_from_center(lat: float, lng: float, radius_km: float) -> dict[str, dict[str, float]]:
    """Approximate bounding rectangle for locationRestriction (Text Search uses rectangle only)."""
    lat_delta = radius_km / 111.0
    lng_scale = max(0.2, abs(math.cos(math.radians(lat))))
    lng_delta = radius_km / (111.0 * lng_scale)
    return {
        "low": {
            "latitude": round(lat - lat_delta, 6),
            "longitude": round(lng - lng_delta, 6),
        },
        "high": {
            "latitude": round(lat + lat_delta, 6),
            "longitude": round(lng + lng_delta, 6),
        },
    }


@dataclass
class GooglePlaceData:
    google_place_id: str | None = None
    name: str | None = None
    formatted_address: str | None = None
    lat: float | None = None
    lng: float | None = None
    phone: str | None = None
    website: str | None = None
    google_maps_uri: str | None = None
    opening_hours: dict[str, Any] | None = None
    description: str | None = None
    rating: float | None = None
    rating_count: int | None = None
    business_status: str | None = None
    primary_type: str | None = None
    photo_name: str | None = None
    matched: bool = False


def get_api_key() -> str | None:
    return os.environ.get("GOOGLE_PLACES_API_KEY") or os.environ.get("GOOGLE_GEOCODING_API_KEY")


def normalize_website_url(url: str | None) -> str | None:
    if not url:
        return None
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    if is_bad_website(url):
        return None
    return url


def names_match(google_name: str, place_name: str) -> bool:
    g = google_name.lower().strip()
    p = place_name.lower().strip()
    if not g or not p:
        return False
    if p[:12] in g or g[:12] in p:
        return True
    if len(p) >= 6 and p in g:
        return True
    return False


def load_cache() -> dict[str, Any]:
    if CACHE_PATH.exists():
        return json.loads(CACHE_PATH.read_text())
    return {}


def save_cache(cache: dict[str, Any]) -> None:
    CACHE_PATH.write_text(json.dumps(cache, indent=2) + "\n")


def _api_post(
    url: str,
    body: dict[str, Any],
    *,
    field_mask: str,
    max_retries: int = 5,
) -> dict[str, Any] | None:
    api_key = get_api_key()
    if not api_key:
        return None

    last_error: Exception | None = None
    for attempt in range(max_retries):
        time.sleep(REQUEST_DELAY)
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(body).encode(),
                headers={
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": api_key,
                    "X-Goog-FieldMask": field_mask,
                    "User-Agent": USER_AGENT,
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=45) as response:
                return json.loads(response.read())
        except urllib.error.HTTPError as exc:
            last_error = exc
            detail = ""
            field_hint = ""
            try:
                raw = exc.read().decode("utf-8", "replace")
                detail = raw[:300]
                parsed = json.loads(raw)
                violations = (
                    parsed.get("error", {}).get("details", [{}])[0]
                    .get("fieldViolations", [])
                )
                if violations:
                    field_hint = violations[0].get("description", "")
            except Exception:
                pass
            if field_hint:
                print(f"  API HTTP {exc.code}: {field_hint}", flush=True)
            elif detail and exc.code not in (400, 404):
                print(f"  API HTTP {exc.code}: {detail}", flush=True)
            # Client errors won't succeed on retry.
            if exc.code in (400, 404):
                break
            if attempt + 1 >= max_retries:
                break
            time.sleep(min(30, (2**attempt) + 1))
        except (
            urllib.error.URLError,
            TimeoutError,
            json.JSONDecodeError,
            ConnectionError,
            http.client.RemoteDisconnected,
            http.client.IncompleteRead,
        ) as exc:
            last_error = exc
            if attempt + 1 >= max_retries:
                break
            time.sleep(min(30, (2**attempt) + 1))

    if last_error:
        print(f"  API error after {max_retries} tries: {last_error}", flush=True)
    return None


def _places_request(
    body: dict[str, Any],
    *,
    field_mask: str,
) -> dict[str, Any] | None:
    return _api_post(SEARCH_URL, body, field_mask=field_mask)


def text_search(
    text_query: str,
    lat: float | None = None,
    lng: float | None = None,
) -> dict[str, Any] | None:
    if not text_query.strip():
        return None

    body: dict[str, Any] = {"textQuery": text_query.strip()}
    if lat is not None and lng is not None:
        body["locationBias"] = {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": 800.0,
            }
        }

    return _places_request(body, field_mask=FIELD_MASK)


def text_search_in_region(
    text_query: str,
    lat: float,
    lng: float,
    *,
    radius_km: float = 25.0,
    page_size: int = 20,
    max_pages: int = MAX_PAGES_PER_QUERY,
    region_code: str = "",
    language_code: str = "",
) -> tuple[list[dict[str, Any]], bool]:
    """Paginated Text Search restricted to a bounding box around lat/lng."""
    if not text_query.strip():
        return [], True

    base_body: dict[str, Any] = {
        "textQuery": text_query.strip(),
        "pageSize": min(max(page_size, 1), 20),
        "locationRestriction": {
            "rectangle": bbox_from_center(lat, lng, radius_km),
        },
    }
    if region_code:
        base_body["regionCode"] = region_code
    if language_code:
        base_body["languageCode"] = language_code

    collected: list[dict[str, Any]] = []
    page_token: str | None = None
    ok = True

    for page_idx in range(max_pages):
        body = dict(base_body)
        if page_token:
            body["pageToken"] = page_token
            time.sleep(PAGE_TOKEN_DELAY)

        payload = _places_request(body, field_mask=DISCOVERY_FIELD_MASK)
        if not payload:
            ok = page_idx > 0 and len(collected) > 0
            if page_idx == 0:
                ok = False
            break

        collected.extend(payload.get("places") or [])
        page_token = payload.get("nextPageToken")
        if not page_token:
            break
        if page_idx + 1 >= max_pages:
            break

    return collected, ok


def search_nearby_in_region(
    lat: float,
    lng: float,
    *,
    radius_km: float = 15.0,
    included_primary_types: tuple[str, ...] = ("buddhist_temple", "hindu_temple"),
    region_code: str = "",
    max_results: int = NEARBY_MAX_RESULTS,
) -> tuple[list[dict[str, Any]], bool]:
    """Nearby Search by primary type — max 20 results per call, no pagination."""
    radius_m = min(max(radius_km * 1000, 500), 50000)
    body: dict[str, Any] = {
        "includedPrimaryTypes": list(included_primary_types),
        "maxResultCount": min(max(max_results, 1), NEARBY_MAX_RESULTS),
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": radius_m,
            }
        },
    }
    if region_code:
        body["regionCode"] = region_code

    payload = _api_post(NEARBY_SEARCH_URL, body, field_mask=NEARBY_DISCOVERY_FIELD_MASK)
    if not payload:
        return [], False
    return payload.get("places") or [], True


def parse_place(place: dict[str, Any], expected_name: str) -> GooglePlaceData:
    result = GooglePlaceData()
    display = (place.get("displayName") or {}).get("text") or ""
    result.name = display or None
    if not names_match(display, expected_name):
        return result

    result.matched = True
    result.google_place_id = place.get("id")
    result.formatted_address = place.get("formattedAddress") or place.get("shortFormattedAddress")
    loc = place.get("location") or {}
    if loc.get("latitude") is not None and loc.get("longitude") is not None:
        result.lat = round(float(loc["latitude"]), 6)
        result.lng = round(float(loc["longitude"]), 6)

    result.phone = place.get("nationalPhoneNumber") or place.get("internationalPhoneNumber")
    result.website = normalize_website_url(place.get("websiteUri"))
    result.google_maps_uri = place.get("googleMapsUri")

    hours = place.get("regularOpeningHours")
    if hours:
        result.opening_hours = {
            "weekdayDescriptions": hours.get("weekdayDescriptions") or [],
            "openNow": hours.get("openNow"),
            "source": "google_places",
        }

    editorial = (place.get("editorialSummary") or {}).get("text")
    generative = (place.get("generativeSummary") or {}).get("overview") or {}
    gen_text = generative.get("text") if isinstance(generative, dict) else None
    result.description = (editorial or gen_text or "").strip() or None

    if place.get("rating") is not None:
        result.rating = float(place["rating"])
    if place.get("userRatingCount") is not None:
        result.rating_count = int(place["userRatingCount"])

    result.business_status = place.get("businessStatus")
    result.primary_type = place.get("primaryType")

    photos = place.get("photos") or []
    if photos and photos[0].get("name"):
        result.photo_name = photos[0]["name"]

    return result


def fetch_place_data(
    name: str,
    address: str | None,
    lat: float | None,
    lng: float | None,
) -> GooglePlaceData:
    parts = [name]
    if address:
        parts.append(address)
    payload = text_search(", ".join(parts), lat, lng)
    if not payload:
        return GooglePlaceData()

    places = payload.get("places") or []
    if not places:
        return GooglePlaceData()

    return parse_place(places[0], name)


def download_place_photo(photo_name: str, dest_base: Path) -> str | None:
    """Download Google place photo to dest_base.{ext}. Returns local path like /places/id.jpg."""
    api_key = get_api_key()
    if not api_key or not photo_name:
        return None

    params = urllib.parse.urlencode({"maxHeightPx": 800, "maxWidthPx": 1200})
    url = f"https://places.googleapis.com/v1/{photo_name}/media?{params}"
    time.sleep(REQUEST_DELAY)

    try:
        req = urllib.request.Request(
            url,
            headers={"X-Goog-Api-Key": api_key, "User-Agent": USER_AGENT},
        )
        with urllib.request.urlopen(req, timeout=45) as response:
            content_type = response.headers.get("Content-Type", "image/jpeg")
            data = response.read()
    except (urllib.error.URLError, TimeoutError, urllib.error.HTTPError):
        return None

    if len(data) < 1200:
        return None

    ext = ".jpg"
    if "png" in content_type:
        ext = ".png"
    elif "webp" in content_type:
        ext = ".webp"

    PHOTOS_DIR.mkdir(parents=True, exist_ok=True)
    full_path = dest_base.with_suffix(ext)
    full_path.write_bytes(data)
    return f"/places/{full_path.name}"
