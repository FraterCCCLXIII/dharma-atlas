#!/usr/bin/env python3
"""Shared utilities for place data pipeline scripts."""

from __future__ import annotations

import json
import re
import urllib.parse
from pathlib import Path

from lib.place_descriptions import is_substantive

ROOT = Path(__file__).resolve().parent.parent.parent
PLACES_PATH = ROOT / "src/data/places.json"
REPORTS_DIR = ROOT / "scripts/reports"
GEOCODE_CACHE_PATH = ROOT / "scripts/geocode-cache.json"
USER_AGENT = "DharmaAtlas/1.0 (place pipeline; local dev)"

BAD_WEBSITE_HOSTS = {
    "mapof.it",
    "facebook.com",
    "twitter.com",
    "x.com",
    "linkedin.com",
    "bit.ly",
    "goo.gl",
}

SUSPICIOUS_COORD_CLUSTERS = [
    (51.16, 10.45, "Germany centroid"),
    (36.7, -118.76, "US California centroid"),
    (22.35, 78.67, "India centroid"),
    (46.6, 1.89, "France centroid"),
    (7.56, 80.71, "Sri Lanka centroid"),
    (24.48, 90.29, "Bangladesh centroid"),
    (4.57, 102.27, "Malaysia centroid"),
    (61.07, -107.99, "Canada centroid"),
]

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


def load_places() -> tuple[dict, list[dict]]:
    payload = json.loads(PLACES_PATH.read_text())
    return payload, list(payload.get("places", []))


def save_places(payload: dict, places: list[dict]) -> None:
    payload["places"] = places
    payload["count"] = len(places)
    PLACES_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")


def normalize_website_host(url: str | None) -> str | None:
    if not url:
        return None
    url = url.strip()
    if not url:
        return None
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    try:
        parsed = urllib.parse.urlparse(url)
    except ValueError:
        return None
    host = (parsed.netloc or parsed.path).lower().removeprefix("www.")
    if not host:
        return None
    path = parsed.path.rstrip("/")
    return f"{host}{path}" if path and path != "/" else host


def is_bad_website(url: str | None) -> bool:
    host = normalize_website_host(url)
    if not host:
        return False
    hostname = host.split("/")[0]
    return hostname in BAD_WEBSITE_HOSTS or hostname.endswith(".mapof.it")


def is_suspicious_coord(lat: float, lng: float, tolerance: float = 0.15) -> bool:
    for cluster_lat, cluster_lng, _ in SUSPICIOUS_COORD_CLUSTERS:
        if abs(lat - cluster_lat) < tolerance and abs(lng - cluster_lng) < tolerance:
            return True
    return False


def infer_coord_precision(folder: str) -> str:
    if not folder:
        return "unknown"
    if folder.startswith("BuddhaNet"):
        return "region"
    if folder.startswith("Goenka Vipassana"):
        return "city"
    if folder in KML_FOLDERS:
        return "pin"
    return "unknown"


def fix_mojibake(text: str) -> str:
    if not text:
        return text
    if "Ã" not in text:
        return text
    try:
        return text.encode("latin-1").decode("utf-8")
    except (UnicodeDecodeError, UnicodeEncodeError):
        return text


def normalize_phone(value: str | None) -> str | None:
    if not value:
        return None
    cleaned = re.sub(r"\s+", " ", value.strip())
    if " or " in cleaned.lower():
        cleaned = re.split(r"\s+or\s+", cleaned, flags=re.I)[0].strip()
    return cleaned or None


def audit_flags(place: dict) -> list[str]:
    flags: list[str] = []
    if not place.get("address"):
        flags.append("missing_address")
    if not place.get("phone"):
        flags.append("missing_phone")
    if not place.get("website"):
        flags.append("missing_website")
    if is_bad_website(place.get("website")):
        flags.append("bad_website")
    lat, lng = place.get("lat"), place.get("lng")
    if lat is not None and lng is not None and is_suspicious_coord(lat, lng):
        flags.append("stacked_coords")
    if place.get("coordPrecision") == "region" or infer_coord_precision(place.get("folder", "")) == "region":
        if "stacked_coords" not in flags and lat is not None and lng is not None:
            if is_suspicious_coord(lat, lng):
                flags.append("stacked_coords")
    name = place.get("name", "")
    address = place.get("address", "")
    if "Ã" in name or "Ã" in address:
        flags.append("encoding_error")
    if place.get("description") and "description" not in (place.get("verifiedFields") or []):
        flags.append("unverified_description")
    elif not is_substantive(place.get("description")):
        flags.append("missing_description")
    if not place.get("photo"):
        flags.append("missing_photo")
    if not place.get("openingHours"):
        flags.append("missing_hours")
    return flags
