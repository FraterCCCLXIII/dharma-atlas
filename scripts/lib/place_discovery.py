#!/usr/bin/env python3
"""Filter, dedupe, and normalize Google Places discovery results."""

from __future__ import annotations

import hashlib
import math
import re
from typing import Any

from lib.google_places import GooglePlaceData, normalize_website_url, parse_place
from lib.place_descriptions import is_substantive
from lib.place_utils import audit_flags, is_bad_website, normalize_website_host

# Name / type signals for Buddhist & Hindu-adjacent venues
RELEVANT_KEYWORDS = (
    "buddh",
    "bodhi",
    "dharma",
    "dhamma",
    "sangha",
    "zen",
    "zendo",
    "chan ",
    "theravada",
    "mahayana",
    "vajrayana",
    "tibet",
    "gelug",
    "kagyu",
    "sakya",
    "nyingma",
    "lama",
    "rinpoche",
    "gompa",
    "stupa",
    "pagoda",
    "vihara",
    "vihāra",
    "wat ",
    " wat",
    "temple",
    "monastery",
    "monastic",
    "meditation",
    "vipassana",
    "mindfulness",
    "retreat center",
    "retreat centre",
    "plum village",
    "thich nhat",
    "shambhala",
    "kadampa",
    "fwbo",
    "triratna",
    "soka gakkai",
    "amitabha",
    "pure land",
    "jodo",
    "nichiren",
    "hindu",
    "mandir",
    "ashram",
    "aashram",
    "iskcon",
    "vedanta",
    "ramakrishna",
    "aurobindo",
    "yoga ashram",
    "sivananda",
    "art of living",
    "satya sai",
    "jain",  # adjacent dharmic tradition
    "tapınak",
    "tapinağı",
    "tapinak",
    "bouddh",  # French
    "budista",  # Romance languages
    "templio buddh",
    "mahamevnawa",
    "chùa",
    " chua",
    "thiền",
    " thien",
    " sgi-",
    " sgi ",
    "sgi-uk",
    "linh son",
    "fo guang",
    "tzu chi",
    "tu viện",
    "tu vien",
    "wat ",
    " wat",
    "shrine",
    "devi ",
    " devi",
    "shakti",
    "gurudwara",  # adjacent
    "gurdvara",
)

EXCLUDE_KEYWORDS = (
    "christian",
    "catholic",
    "protestant",
    "orthodox church",
    "baptist",
    "methodist",
    "presbyterian",
    "lutheran",
    "anglican",
    "episcopal",
    "mosque",
    "masjid",
    "synagogue",
    "jewish",
    "mormon",
    "jehovah",
    "seventh-day",
    "pentecostal",
    "evangelical",
    "aikido",
    "aikikai",
    "karate",
    "dojo",
    "taekwondo",
    "judo",
    "martial arts",
    "yoga studio",
    "hot yoga",
    "pilates",
    "crossfit",
    "gym",
    "fitness",
    "hotel",
    "restaurant",
    "cafe",
    "coffee",
    "spa ",
    " nail ",
    "massage parlor",
    " evi",  # Turkish "home" — user-created map pins
    "'s home",
    " home",
    " da ",  # spam pin suffix
    "admin123",
    "buga man",
    "benedictine",
    "augustine",
    "cistercian",
    "catholic",
    "orthodox",
    "beauty",
    "wellbeing",
    "well-being",
    "craniosacral",
    "reiki master",
    "bach flower",
    "yoga and meditation studio",
    "yoga & meditation",
    "transcendental meditation",
)

RELEVANT_PRIMARY_TYPES = {
    "buddhist_temple",
    "hindu_temple",
    "place_of_worship",
    "monastery",
    "church",  # only kept when name matches RELEVANT_KEYWORDS
}

IRRELEVANT_PRIMARY_TYPES = {
    "sports_school",
    "gym",
    "fitness_center",
    "restaurant",
    "cafe",
    "lodging",
    "hotel",
    "store",
    "shopping_mall",
    "school",
    "university",
    "hospital",
    "doctor",
    "dentist",
    "beauty_salon",
    "spa",
    "night_club",
    "bar",
    "real_estate_agency",
    "travel_agency",
    "corporate_office",
}


def normalize_name(name: str) -> str:
    return re.sub(r"\s+", " ", (name or "").strip().lower())


def haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371000
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def place_id(name: str, lat: float, lng: float) -> str:
    key = f"{name}|{lat:.4f}|{lng:.4f}"
    return hashlib.md5(key.encode()).hexdigest()[:12]


def infer_type(name: str, primary_type: str | None = None) -> str:
    n = name.lower()
    pt = (primary_type or "").lower()
    if "ashram" in n or "ashram" in pt:
        return "Ashram"
    if any(w in n for w in ("monastery", "vihara", "vihāra", "gompa", "wat ")) or pt == "monastery":
        return "Monastery"
    if "temple" in n or pt == "hindu_temple":
        return "Temple"
    if "meditation" in n or "vipassana" in n or "retreat" in n:
        return "Meditation Center"
    if "institute" in n:
        return "Institute"
    if "center" in n or "centre" in n:
        return "Center"
    return "Center"


def infer_faith(name: str, primary_type: str | None = None) -> str:
    blob = f"{name} {(primary_type or '')}".lower()
    if any(w in blob for w in ("hindu", "iskcon", "mandir", "vedanta", "ramakrishna", "satya sai")):
        return "Hindu"
    if pt := (primary_type or "").lower():
        if pt == "hindu_temple":
            return "Hindu"
    return "Buddhist"


def infer_tradition(name: str, faith: str) -> str:
    n = name.lower()
    if faith == "Hindu":
        return "Hindu"
    if any(w in n for w in ("vipassana", "dhamma ", "goenka", "theravada")):
        return "Theravada"
    if any(w in n for w in ("zen", "zendo", "chan ", "son ", "thien")):
        return "Zen"
    if any(w in n for w in ("tibet", "gelug", "kagyu", "sakya", "nyingma", "vajrayana")):
        return "Tibetan"
    if any(w in n for w in ("pure land", "amitabha", "jodo", "nichiren", "soka")):
        return "Pure Land"
    if "plum village" in n or "thich nhat" in n:
        return "Zen"
    return "Buddhist"


def infer_schools(name: str) -> list[str]:
    n = name.lower()
    schools: list[str] = []
    mapping = {
        "vipassana": "vipassana",
        "goenka": "vipassana",
        "gelug": "gelug",
        "kagyu": "kagyu",
        "sakya": "sakya",
        "nyingma": "nyingma",
        "iskcon": "iskcon",
    }
    for token, slug in mapping.items():
        if token in n:
            schools.append(slug)
    return schools


def _has_substantive_address(raw: dict[str, Any] | None) -> bool:
    if not raw:
        return False
    address = (raw.get("formattedAddress") or raw.get("shortFormattedAddress") or "").strip()
    return len(address) >= 18 and "," in address


def _primary_type_quality_ok(name: str, primary_type: str | None, raw: dict[str, Any] | None) -> bool:
    """Accept buddhist_temple / hindu_temple when Google metadata looks legitimate."""
    pt = (primary_type or "").lower()
    if pt not in ("buddhist_temple", "hindu_temple"):
        return False

    rating_count = raw.get("userRatingCount") if raw else None
    if isinstance(rating_count, int) and rating_count >= 2:
        return True
    if _has_substantive_address(raw):
        return True
    if raw and ((raw.get("editorialSummary") or {}).get("text") or (raw.get("generativeSummary") or {})):
        return True

    # Reject short personal-name pins with no venue signals
    tokens = [t for t in re.split(r"\s+", name.strip()) if t]
    if len(tokens) <= 2 and len(name) < 24:
        return False
    return False


def _looks_like_spam_name(name: str) -> bool:
    cleaned = name.strip()
    if len(cleaned) < 4:
        return True
    alpha = sum(1 for c in cleaned if c.isalpha())
    if alpha < 4:
        return True
    # Obvious user-created pin titles
    if re.search(r"\b(admin|test|home|evi|123456)\b", cleaned, re.I):
        return True
    return False


def is_relevant(
    name: str,
    primary_type: str | None = None,
    *,
    raw: dict[str, Any] | None = None,
) -> bool:
    blob = name.lower()
    pt = (primary_type or "").lower()

    if _looks_like_spam_name(name):
        return False
    if any(ex in blob for ex in EXCLUDE_KEYWORDS):
        return False
    if pt in IRRELEVANT_PRIMARY_TYPES:
        return False

    if any(kw in blob for kw in RELEVANT_KEYWORDS):
        return True
    if pt in ("buddhist_temple", "hindu_temple") and _primary_type_quality_ok(name, primary_type, raw):
        return True
    if pt in RELEVANT_PRIMARY_TYPES and pt not in ("church", "place_of_worship"):
        return True
    if pt == "place_of_worship" and any(kw in blob for kw in RELEVANT_KEYWORDS):
        return True
    if pt == "church" and any(kw in blob for kw in RELEVANT_KEYWORDS):
        return True

    return False


def google_raw_to_data(raw: dict[str, Any]) -> GooglePlaceData:
    display = (raw.get("displayName") or {}).get("text") or ""
    data = parse_place(raw, display)
    data.matched = True
    return data


def build_place_record(
    raw: dict[str, Any],
    *,
    cell_name: str,
    cell_country: str,
    cell_region: str,
) -> dict[str, Any] | None:
    display = (raw.get("displayName") or {}).get("text") or ""
    if not display.strip():
        return None

    primary_type = raw.get("primaryType")
    if raw.get("businessStatus") == "CLOSED_PERMANENTLY":
        return None
    if not is_relevant(display, primary_type, raw=raw):
        return None

    data = google_raw_to_data(raw)
    if data.lat is None or data.lng is None:
        return None

    faith = infer_faith(display, primary_type)
    tradition = infer_tradition(display, faith)
    schools = infer_schools(display)
    folder = f"Google Discovery ({cell_country})"

    record: dict[str, Any] = {
        "id": place_id(display, data.lat, data.lng),
        "name": display.strip(),
        "lat": data.lat,
        "lng": data.lng,
        "tradition": tradition,
        "faith": faith,
        "type": infer_type(display, primary_type),
        "folder": folder,
        "address": data.formatted_address or "",
        "phone": data.phone,
        "website": data.website,
        "coordPrecision": "address",
        "dataSource": "google_places_discovery",
    }

    if schools:
        record["schools"] = schools
    if data.google_place_id:
        record["googlePlaceId"] = data.google_place_id
    if data.google_maps_uri:
        record["googleMapsUri"] = data.google_maps_uri
    if data.opening_hours:
        record["openingHours"] = data.opening_hours
    if data.description and is_substantive(data.description):
        record["description"] = data.description[:500]
        record["descriptionSource"] = "google_places"
    if data.rating is not None:
        record["googleRating"] = data.rating
    if data.rating_count is not None:
        record["googleRatingCount"] = data.rating_count
    if data.business_status:
        record["businessStatus"] = data.business_status
    if primary_type:
        record["googlePrimaryType"] = primary_type

    record["qualityFlags"] = audit_flags(record)
    return record


class PlaceIndex:
    """Fast dedupe against existing and newly discovered places."""

    def __init__(self, places: list[dict]) -> None:
        self.by_google_id: dict[str, dict] = {}
        self.by_website: dict[str, dict] = {}
        self.coords: list[tuple[float, float, str]] = []

        for place in places:
            self.add(place)

    def add(self, place: dict) -> None:
        gid = place.get("googlePlaceId")
        if gid:
            self.by_google_id[gid] = place
        site = normalize_website_host(place.get("website"))
        if site:
            self.by_website[site] = place
        lat, lng = place.get("lat"), place.get("lng")
        if lat is not None and lng is not None:
            self.coords.append((float(lat), float(lng), normalize_name(place.get("name", ""))))

    def is_duplicate(self, candidate: dict) -> bool:
        gid = candidate.get("googlePlaceId")
        if gid and gid in self.by_google_id:
            return True

        site = normalize_website_host(candidate.get("website"))
        if site and site in self.by_website:
            return True

        lat, lng = candidate.get("lat"), candidate.get("lng")
        if lat is None or lng is None:
            return False

        name = normalize_name(candidate.get("name", ""))
        for plat, plng, pname in self.coords:
            if haversine_m(lat, lng, plat, plng) > 250:
                continue
            if name == pname:
                return True
            if name[:10] in pname or pname[:10] in name:
                return True
        return False
