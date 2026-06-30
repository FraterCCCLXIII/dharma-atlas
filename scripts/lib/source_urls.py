#!/usr/bin/env python3
"""Recover place websites from directory sources, OSM, and optional Google Places."""

from __future__ import annotations

import json
import math
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from html import unescape
from pathlib import Path

from lib.place_utils import (
    is_bad_website,
    is_suspicious_coord,
    normalize_website_host,
    USER_AGENT,
)

ROOT = Path(__file__).resolve().parent.parent.parent
SOURCES_DIR = ROOT / "data/sources"
DHAMMA_URLS_PATH = SOURCES_DIR / "dhamma-org-urls.json"
DHAMMA_MAPS_URL = "https://www.dhamma.org/en-US/maps"
BUDDHANET_SCRAPE_PATH = SOURCES_DIR / "buddhanet-scrape.json"

OVERPASS_DELAY = 0.5
GOOGLE_PLACES_DELAY = 0.2


def normalize_name_key(name: str) -> str:
    text = unescape(name or "").lower()
    text = re.sub(r"\s+non-center\s*$", "", text, flags=re.I)
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_website_url(url: str | None) -> str | None:
    if not url:
        return None
    url = unescape(url.strip())
    if not url or url == "</strong>":
        return None
    if url.startswith("www."):
        url = f"https://{url}"
    if not url.startswith(("http://", "https://")):
        if re.match(r"[a-z0-9.-]+\.[a-z]{2,}", url, re.I):
            url = f"https://{url}"
        else:
            return None
    if is_bad_website(url):
        return None
    return url


def extract_urls_from_text(text: str) -> list[str]:
    if not text:
        return []
    text = unescape(text)
    found: list[str] = []
    for pattern in (
        r"https?://[^\s<>\"']+",
        r"(?:^|[\s,])(www\.[^\s<>\"',]+)",
    ):
        for match in re.finditer(pattern, text, re.I):
            url = match.group(1) if match.lastindex else match.group(0)
            url = url.strip(".,);")
            normalized = normalize_website_url(url)
            if normalized:
                found.append(normalized)
    return found


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


def fetch_url(url: str, timeout: int = 45) -> str | None:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.read().decode("utf-8", "replace")
    except (urllib.error.URLError, TimeoutError, ValueError):
        return None


def scrape_dhamma_maps_urls(*, allow_fetch: bool = True) -> dict[str, str]:
    """Map normalized center title → website URL from dhamma.org maps page."""
    if DHAMMA_URLS_PATH.exists() and not allow_fetch:
        payload = json.loads(DHAMMA_URLS_PATH.read_text())
        return payload.get("by_title", payload)

    html = fetch_url(DHAMMA_MAPS_URL)
    if not html:
        if DHAMMA_URLS_PATH.exists():
            payload = json.loads(DHAMMA_URLS_PATH.read_text())
            return payload.get("by_title", payload)
        return {}

    scripts = re.findall(r"<script[^>]*>([\s\S]*?)</script>", html)
    script = max(scripts, key=len)
    by_title: dict[str, str] = {}
    blocks = re.split(r'"iscenter":', script)
    link_re = re.compile(
        r"href='(https?://[^']+)' target='_blank'\\u003eWebsite"
    )
    title_re = re.compile(r'"title":"([^"]+)"')

    for block in blocks[1:]:
        title_match = title_re.search(block)
        url_match = link_re.search(block)
        if not title_match or not url_match:
            continue
        title = unescape(title_match.group(1))
        url = normalize_website_url(url_match.group(1))
        if url:
            by_title[title] = url

    DHAMMA_URLS_PATH.parent.mkdir(parents=True, exist_ok=True)
    DHAMMA_URLS_PATH.write_text(
        json.dumps({"source": DHAMMA_MAPS_URL, "count": len(by_title), "by_title": by_title}, indent=2)
        + "\n"
    )
    return by_title


def build_dhamma_index(by_title: dict[str, str]) -> dict[str, str]:
    index: dict[str, str] = {}
    for title, url in by_title.items():
        key = normalize_name_key(title)
        if key:
            index[key] = url
        # Also index without "Dhamma " prefix for partial matches
        stripped = re.sub(r"^dhamma\s+", "", key)
        if stripped and stripped not in index:
            index[stripped] = url
    return index


def match_dhamma_url(name: str, dhamma_index: dict[str, str]) -> str | None:
    key = normalize_name_key(name)
    if key in dhamma_index:
        return dhamma_index[key]
    if "vipassana" in key:
        for idx_key, url in dhamma_index.items():
            if key in idx_key or idx_key in key:
                return url
    # Center names often start with Dhamma
    for idx_key, url in dhamma_index.items():
        if key.endswith(idx_key) or idx_key.endswith(key):
            if len(key) >= 8 and len(idx_key) >= 8:
                return url
    return None


def build_buddhanet_index() -> dict[str, str]:
    if not BUDDHANET_SCRAPE_PATH.exists():
        return {}
    rows = json.loads(BUDDHANET_SCRAPE_PATH.read_text())
    index: dict[str, str] = {}
    for row in rows:
        folder = row.get("folder") or ""
        country = ""
        match = re.search(r"\(([^)]+)\)$", folder)
        if match:
            country = normalize_name_key(match.group(1))
        name_key = normalize_name_key(row.get("name") or "")
        if not name_key:
            continue

        urls: list[str] = []
        site = normalize_website_url(row.get("website"))
        if site:
            urls.append(site)
        urls.extend(extract_urls_from_text(row.get("address") or ""))

        for url in urls:
            index[f"{name_key}|{country}"] = url
            if name_key not in index:
                index[name_key] = url
    return index


def match_buddhanet_url(name: str, folder: str, buddhanet_index: dict[str, str]) -> str | None:
    country = ""
    match = re.search(r"\(([^)]+)\)$", folder or "")
    if match:
        country = normalize_name_key(match.group(1))
    name_key = normalize_name_key(name)
    if f"{name_key}|{country}" in buddhanet_index:
        return buddhanet_index[f"{name_key}|{country}"]
    if name_key in buddhanet_index:
        return buddhanet_index[name_key]
    return None


def overpass_website(lat: float, lng: float, name: str) -> str | None:
    query = f"""
    [out:json][timeout:25];
    (
      node(around:800,{lat},{lng})["amenity"~"place_of_worship|monastery"];
      way(around:800,{lat},{lng})["amenity"~"place_of_worship|monastery"];
      relation(around:800,{lat},{lng})["amenity"~"place_of_worship|monastery"];
      node(around:800,{lat},{lng})["religion"="buddhist"];
      way(around:800,{lat},{lng})["religion"="buddhist"];
    );
    out tags center;
    """
    encoded = urllib.parse.urlencode({"data": query}).encode()
    try:
        req = urllib.request.Request(
            "https://overpass-api.de/api/interpreter",
            data=encoded,
            headers={"User-Agent": USER_AGENT},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=35) as response:
            payload = json.loads(response.read())
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return None

    elements = payload.get("elements", [])
    best_url = None
    best_score = -1.0
    name_lower = name.lower()

    for element in elements:
        tags = element.get("tags") or {}
        el_lat = element.get("lat") or (element.get("center") or {}).get("lat")
        el_lng = element.get("lon") or (element.get("center") or {}).get("lon")
        if el_lat is None or el_lng is None:
            continue

        dist = haversine_km(lat, lng, el_lat, el_lng)
        score = max(0.0, 1.0 - dist / 0.8)
        tag_name = (tags.get("name") or "").lower()
        if tag_name and (name_lower in tag_name or tag_name in name_lower):
            score += 2.0

        url = tags.get("website") or tags.get("contact:website") or tags.get("url")
        normalized = normalize_website_url(url)
        if not normalized:
            continue

        if score > best_score:
            best_score = score
            best_url = normalized

    # Require a name match or very close proximity — avoids wrong venue websites
    if best_url and best_score < 2.0:
        return None
    return best_url


def google_places_website(
    name: str,
    lat: float | None,
    lng: float | None,
    address: str | None,
) -> str | None:
    api_key = os.environ.get("GOOGLE_PLACES_API_KEY") or os.environ.get("GOOGLE_GEOCODING_API_KEY")
    if not api_key:
        return None

    query_parts = [name]
    if address:
        query_parts.append(address)
    text_query = ", ".join(p for p in query_parts if p)
    if not text_query:
        return None

    body: dict = {"textQuery": text_query}
    if lat is not None and lng is not None:
        body["locationBias"] = {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": 800.0,
            }
        }

    time.sleep(GOOGLE_PLACES_DELAY)
    try:
        req = urllib.request.Request(
            "https://places.googleapis.com/v1/places:searchText",
            data=json.dumps(body).encode(),
            headers={
                "Content-Type": "application/json",
                "X-Goog-Api-Key": api_key,
                "X-Goog-FieldMask": "places.websiteUri,places.displayName",
                "User-Agent": USER_AGENT,
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=20) as response:
            payload = json.loads(response.read())
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, urllib.error.HTTPError):
        return None

    places = payload.get("places") or []
    if not places:
        return None

    place = places[0]
    display = place.get("displayName") or {}
    candidate_name = (display.get("text") or "").lower()
    if name.lower()[:12] not in candidate_name and candidate_name[:12] not in name.lower():
        return None

    return normalize_website_url(place.get("websiteUri"))


def is_dhamma_org_url(url: str | None) -> bool:
    host = normalize_website_host(url) or ""
    hostname = host.split("/")[0]
    return hostname.endswith(".dhamma.org") or hostname == "dhamma.org"


def needs_website_recovery(place: dict) -> bool:
    website = place.get("website")
    if not website or is_bad_website(website):
        return True
    folder = place.get("folder") or ""
    if folder.startswith("Goenka Vipassana") and not is_dhamma_org_url(website):
        return True
    return False


def should_skip_overpass(place: dict) -> bool:
    precision = place.get("coordPrecision") or ""
    lat, lng = place.get("lat"), place.get("lng")
    if lat is None or lng is None:
        return True
    if precision in ("address", "pin"):
        return False
    if precision == "city" and not is_suspicious_coord(lat, lng):
        return False
    return is_suspicious_coord(lat, lng) or precision in ("region", "unknown")


def recover_website_for_place(
    place: dict,
    *,
    dhamma_index: dict[str, str],
    buddhanet_index: dict[str, str],
    use_overpass: bool = True,
    use_google: bool = True,
) -> tuple[str | None, str]:
    folder = place.get("folder") or ""
    name = place.get("name") or ""
    address = place.get("address") or ""

    if folder.startswith("Goenka Vipassana"):
        url = match_dhamma_url(name, dhamma_index)
        if url:
            return url, "dhamma.org"

    if folder.startswith("BuddhaNet"):
        url = match_buddhanet_url(name, folder, buddhanet_index)
        if url:
            return url, "buddhanet"
        for url in extract_urls_from_text(address):
            return url, "buddhanet-address"

    lat, lng = place.get("lat"), place.get("lng")
    if use_overpass and lat is not None and lng is not None and not should_skip_overpass(place):
        url = overpass_website(lat, lng, name)
        time.sleep(OVERPASS_DELAY)
        if url:
            return url, "osm"

    if use_google:
        url = google_places_website(name, lat, lng, address)
        if url:
            return url, "google-places"

    return None, ""


def apply_recovered_website(place: dict, url: str) -> None:
    place["website"] = url
    flags = set(place.get("qualityFlags") or [])
    flags.discard("missing_website")
    flags.discard("bad_website")
    place["qualityFlags"] = list(flags)
