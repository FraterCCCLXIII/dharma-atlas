#!/usr/bin/env python3
"""Merge scraped directory sources into src/data/places.json."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLACES_PATH = ROOT / "src/data/places.json"
SOURCES_DIR = ROOT / "data/sources"
GEOCODE_CACHE_PATH = ROOT / "scripts/geocode-cache.json"
USER_AGENT = "DharmaStreams/1.0 (directory import; local dev)"
NOMINATIM_DELAY = 1.05
BUDDHANET_DELAY = 0.2

TRADITION_MAP = {
    "theravada": "Theravada",
    "mahayana": "Mahayana",
    "vajrayana": "Tibetan",
    "vajrayana (tibetan)": "Tibetan",
    "zen": "Zen",
    "chan": "Zen",
    "pure land": "Pure Land",
    "non-sectarian": "Buddhist",
    "non-sectarian/mixed": "Buddhist",
    "mixed": "Buddhist",
}

TIBETAN_SCHOOLS = {
    "gelug": "gelug",
    "kagyu": "kagyu",
    "sakya": "sakya",
    "nyingma": "nyingma",
    "jonang": "gelug",
    "bon": "bon",
}


@dataclass
class RawPlace:
    name: str
    address: str = ""
    phone: str | None = None
    website: str | None = None
    tradition: str = "Buddhist"
    faith: str = "Buddhist"
    type: str = "Center"
    folder: str = "Imported"
    schools: list[str] = field(default_factory=list)
    geocode_query: str = ""
    source: str = ""


def load_json(path: Path) -> dict | list:
    return json.loads(path.read_text())


def save_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + "\n")


def fetch_url(url: str, timeout: int = 45) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return response.read().decode("latin-1", "replace")


def normalize_name(name: str) -> str:
    return re.sub(r"\s+", " ", name.strip().lower())


def normalize_website(url: str | None) -> str | None:
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


def extract_phone(text: str) -> str | None:
    if not text:
        return None
    match = re.search(
        r"(?:Phone|Tel|Telephone|Fax)[:\s]*([+\d().\-/\s]{7,})",
        text,
        re.I,
    )
    if not match:
        return None
    phone = re.sub(r"\s+", " ", match.group(1)).strip(" ,;")
    return phone or None


def extract_website(text: str) -> str | None:
    if not text:
        return None
    for pattern in (
        r"(?:Website|Url|URL)[:\s]*(?:<a[^>]+href=\"([^\"]+)\"|(\S+))",
        r"(https?://[^\s<>\"]+)",
        r"(www\.[^\s<>\"]+)",
    ):
        match = re.search(pattern, text, re.I)
        if match:
            url = next(g for g in match.groups() if g)
            if url.startswith("www."):
                url = f"https://{url}"
            return url.rstrip(".,)")
    return None


def infer_type(name: str) -> str:
    n = name.lower()
    if "ashram" in n:
        return "Ashram"
    if any(w in n for w in ("monastery", "vihara", "vihāra", "gompa", "wat ")):
        return "Monastery"
    if "temple" in n:
        return "Temple"
    if "meditation" in n:
        return "Meditation Center"
    if "institute" in n:
        return "Institute"
    if "center" in n or "centre" in n:
        return "Center"
    return "Center"


def infer_faith(name: str, folder: str = "") -> str:
    blob = f"{name} {folder}".lower()
    if any(w in blob for w in ("hindu", "iskcon", "mandir", "vedanta", "yoga ashram")):
        return "Hindu"
    return "Buddhist"


def map_tradition(value: str | None, name: str = "", folder: str = "") -> str:
    if value:
        mapped = TRADITION_MAP.get(value.strip().lower())
        if mapped:
            return mapped
        if value in ("Gelug", "Kagyu", "Sakya", "Nyingma", "Jonang", "Secular"):
            return "Tibetan"
    blob = f"{name} {folder}".lower()
    if "vipassana" in blob or "dhamma " in blob or "goenka" in blob:
        return "Theravada"
    if any(w in blob for w in ("zen", "zendo", "chan ")):
        return "Zen"
    if any(w in blob for w in ("tibet", "gelug", "kagyu", "sakya", "nyingma")):
        return "Tibetan"
    if "plum village" in blob or "thich nhat" in blob:
        return "Zen"
    return "Buddhist"


def tibetan_schools(value: str | None) -> list[str]:
    if not value:
        return []
    slug = TIBETAN_SCHOOLS.get(value.strip().lower())
    return [slug] if slug else []


def load_geocode_cache() -> dict[str, dict]:
    if GEOCODE_CACHE_PATH.exists():
        return load_json(GEOCODE_CACHE_PATH)
    return {}


COUNTRY_CODES = {
    "united states of america": "us",
    "usa": "us",
    "canada": "ca",
    "united kingdom": "gb",
    "australia": "au",
    "india": "in",
    "thailand": "th",
    "myanmar": "mm",
    "burma": "mm",
    "nepal": "np",
    "sri lanka": "lk",
    "malaysia": "my",
    "china": "cn",
    "japan": "jp",
    "france": "fr",
    "germany": "de",
    "brazil": "br",
    "mexico": "mx",
    "spain": "es",
    "italy": "it",
    "switzerland": "ch",
    "netherlands": "nl",
    "new zealand": "nz",
    "singapore": "sg",
    "taiwan": "tw",
    "vietnam": "vn",
    "indonesia": "id",
    "philippines": "ph",
    "south africa": "za",
    "argentina": "ar",
    "chile": "cl",
    "colombia": "co",
    "peru": "pe",
    "israel": "il",
    "hong kong": "hk",
    "korea": "kr",
    "mongolia": "mn",
    "cambodia": "kh",
    "laos": "la",
    "bhutan": "bt",
    "bangladesh": "bd",
    "international": "",
}


def country_name_from_folder(folder: str) -> str:
    match = re.search(r"\(([^)]+)\)$", folder)
    return match.group(1).strip() if match else ""


def country_from_folder(folder: str) -> str:
    return COUNTRY_CODES.get(country_name_from_folder(folder).lower(), "")


def extract_locality(address: str, country_name: str) -> str:
    """Best-effort city/region string for shared geocoding."""
    if not address:
        return country_name
    text = unescape(address).replace("&nbsp;", " ")
    text = re.sub(r"\s+", " ", text).strip()
    if "," in text and text.count(",") >= 2:
        return text
    if "·" in text:
        text = text.split("·")[-1].strip()
    parts = re.split(r"\s{2,}", text)
    tail = parts[-1].strip() if parts else text
    if re.search(r"\d{4,}", tail) or len(tail.split()) >= 2:
        return f"{tail}, {country_name}" if country_name else tail
    return f"{text}, {country_name}" if country_name else text


US_STATE_NAMES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming", "DC": "Washington DC",
}


def buddhanet_region_query(address: str, country_name: str) -> str:
    text = unescape(address).replace("&nbsp;", " ")
    text = re.sub(r"\s+", " ", text).strip()
    parts = re.split(r"\s{2,}", text)
    tail = parts[-1].strip() if parts else text

    if country_name == "United States of America":
        match = re.search(r"\b([A-Z]{2})\s+\d{5}\b", tail)
        if match:
            state = US_STATE_NAMES.get(match.group(1), match.group(1))
            return f"{state}, USA"
        match = re.search(r"\b([A-Z]{2})\b", tail)
        if match and match.group(1) in US_STATE_NAMES:
            return f"{US_STATE_NAMES[match.group(1)]}, USA"

    if country_name == "Canada":
        match = re.search(r"\b(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)\b", tail)
        if match:
            return f"{match.group(1)}, Canada"

    if country_name == "Australia":
        match = re.search(r"\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\b", tail)
        if match:
            return f"{match.group(1)}, Australia"

    if country_name == "India":
        for state in (
            "Maharashtra", "Uttar Pradesh", "Karnataka", "Tamil Nadu", "Kerala",
            "West Bengal", "Gujarat", "Rajasthan", "Bihar", "Madhya Pradesh",
            "Punjab", "Haryana", "Odisha", "Assam", "Himachal Pradesh",
        ):
            if state.lower() in tail.lower():
                return f"{state}, India"

    city = city_from_messy_address(address)
    if city and country_name:
        return f"{city}, {country_name}"

    return country_name or "Unknown"


def geocode_query_for_place(place: dict) -> str:
    """Best-effort geocode query from an existing place record."""
    folder = place.get("folder") or ""
    country_name = country_name_from_folder(folder)
    address = unescape((place.get("address") or "")).replace("&nbsp;", " ").strip()
    name = (place.get("name") or "").strip()

    if address:
        if folder.startswith("BuddhaNet"):
            city = city_from_messy_address(address)
            if city and country_name:
                return f"{city}, {country_name}"
            return buddhanet_region_query(address, country_name)
        return extract_locality(address, country_name)
    if name and country_name:
        return f"{name}, {country_name}"
    return name or country_name or "Unknown"


def city_from_messy_address(address: str) -> str:
    text = unescape(address).replace("&nbsp;", " ")
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return ""
    parts = re.split(r"\s{2,}", text)
    tail = parts[-1].strip() if parts else text
    tail = re.sub(r"\b\d{4,}\b", "", tail).strip(" ,.-")
    if not tail:
        return text[:60]
    tokens = [t for t in re.split(r"[,\s]+", tail) if t]
    if len(tokens) >= 3:
        return " ".join(tokens[:2])
    if len(tokens) == 2:
        return tokens[0]
    return tail[:60]


def locality_for_raw(raw: RawPlace) -> tuple[str, str]:
    """Return (locality_key, geocode_query) for batch geocoding."""
    country_name = country_name_from_folder(raw.folder)
    country_code = country_from_folder(raw.folder)

    if raw.folder.startswith("Goenka Vipassana"):
        query = (raw.address or raw.geocode_query or raw.name).strip()
    elif raw.folder.startswith("BuddhaNet"):
        if raw.address:
            city = city_from_messy_address(raw.address)
            if city and country_name:
                query = f"{city}, {country_name}"
            else:
                query = buddhanet_region_query(raw.address, country_name)
        else:
            query = buddhanet_region_query(raw.address, country_name)
    elif raw.address:
        query = extract_locality(raw.address, country_name)
    elif raw.geocode_query:
        query = raw.geocode_query
    elif country_name:
        query = f"{raw.name}, {country_name}"
    else:
        query = raw.name

    query = re.sub(r"\s+", " ", query).strip(" ,")
    key = f"loc:{country_code or country_name.lower()}:{query.lower()}"
    return key, query


def cache_lookup(cache: dict[str, dict], query: str) -> tuple[float, float] | None:
    entry = cache.get(query.strip().lower())
    if entry and entry.get("lat") is not None and entry.get("lng") is not None:
        return entry["lat"], entry["lng"]
    return None


def geocode_api(
    query: str,
    cache: dict[str, dict],
    country_code: str = "",
    *,
    allow_api: bool,
) -> tuple[float, float] | None:
    key = query.strip().lower()
    if not key:
        return None
    cached = cache_lookup(cache, key)
    if cached:
        return cached
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


def build_locality_coords(
    raws: list[RawPlace],
    cache: dict[str, dict],
    *,
    allow_api: bool,
) -> dict[str, tuple[float, float]]:
    """Geocode each unique locality once instead of every place."""
    needed: dict[str, tuple[str, str]] = {}
    for raw in raws:
        loc_key, query = locality_for_raw(raw)
        cc = country_from_folder(raw.folder)
        needed.setdefault(loc_key, (query, cc))

    resolved: dict[str, tuple[float, float]] = {}
    api_calls = 0
    total = len(needed)
    print(f"  Resolving {total} unique localities (allow_api={allow_api})…")

    for idx, (loc_key, (query, cc)) in enumerate(sorted(needed.items()), start=1):
        if loc_key in resolved:
            continue
        had_cache = cache_lookup(cache, query) is not None
        coords = geocode_api(query, cache, cc, allow_api=allow_api)
        if coords:
            resolved[loc_key] = coords
        if allow_api and not had_cache:
            api_calls += 1
        if idx % 50 == 0 or idx == total:
            print(f"    Localities {idx}/{total} — resolved {len(resolved)}, api calls {api_calls}")
            save_json(GEOCODE_CACHE_PATH, cache)

    return resolved


def coords_for_raw(
    raw: RawPlace,
    cache: dict[str, dict],
    locality_coords: dict[str, tuple[float, float]],
) -> tuple[float, float] | None:
    loc_key, query = locality_for_raw(raw)
    if loc_key in locality_coords:
        return locality_coords[loc_key]
    return cache_lookup(cache, query)


def write_places(existing: list[dict], added: list[dict]) -> None:
    merged = existing + added
    merged.sort(key=lambda p: p["name"].lower())
    payload = {
        "source": "https://www.google.com/maps/d/u/0/viewer?mid=1NrKT9tt74PDeKaq9aFQ4FQZjSrVU9j4",
        "sourceName": "Global Buddhist & Dharma Centers",
        "sourceCredit": "Shambhala Publications, Office of Tibet, dhamma.org, BuddhaNet, Wolf K, Wikipedia",
        "count": len(merged),
        "places": merged,
    }
    save_json(PLACES_PATH, payload)


def parse_tibetoffice() -> list[RawPlace]:
    data = load_json(SOURCES_DIR / "tibetoffice-dharma-centers.json")
    rows: list[RawPlace] = []
    for region_key, country in (("united_states", "USA"), ("canada", "Canada")):
        for row in data.get(region_key, []):
            contact = row.get("contact") or ""
            rows.append(
                RawPlace(
                    name=row["name"],
                    address=row.get("address") or "",
                    phone=extract_phone(contact),
                    website=extract_website(contact),
                    tradition=map_tradition(row.get("tradition"), row["name"]),
                    schools=tibetan_schools(row.get("tradition")),
                    type=infer_type(row["name"]),
                    folder=f"Office of Tibet ({country})",
                    geocode_query=f"{row['name']}, {row.get('address', '')}, {country}",
                    source="tibetoffice.org",
                )
            )
    return rows


def parse_dhamma_org() -> list[RawPlace]:
    data = load_json(SOURCES_DIR / "dhamma-org-directory.json")
    rows: list[RawPlace] = []
    for center in data.get("centers", []):
        location = (center.get("location") or "").strip()
        name = (center.get("name") or "").strip()
        if not name:
            continue
        rows.append(
            RawPlace(
                name=name,
                address=location,
                tradition="Theravada",
                schools=["vipassana"],
                type="Meditation Center",
                folder="Goenka Vipassana (dhamma.org)",
                geocode_query=f"{name}, {location}",
                source="dhamma.org",
            )
        )
    return rows


def parse_hindu_ashrams() -> list[RawPlace]:
    data = load_json(SOURCES_DIR / "wikipedia-largest-hindu-ashrams.json")
    rows: list[RawPlace] = []
    for ashram in data.get("ashrams", []):
        place = ashram.get("place") or ""
        country = ashram.get("country") or "India"
        rows.append(
            RawPlace(
                name=ashram["name"],
                address=f"{place}, {country}",
                tradition="Hindu",
                faith="Hindu",
                type="Ashram",
                folder="Wikipedia — Largest Hindu Ashrams",
                geocode_query=f"{ashram['name']}, {place}, {country}",
                source="wikipedia.org",
            )
        )
    return rows


def parse_wolf_k_text(text: str) -> list[RawPlace]:
    rows: list[RawPlace] = []
    current_country = "International"
    country_map = {
        "retreats in india": "India",
        "retreats in nepal": "Nepal",
        "retreats in thailand": "Thailand",
        "retreats in malaysia": "Malaysia",
        "retreats in sri lanka": "Sri Lanka",
        "retreats in burma": "Myanmar",
        "retreats in myanamar": "Myanmar",
        "retreats in china": "China",
        "other retreats": "International",
    }

    lines = [line.strip() for line in text.splitlines()]
    i = 0
    while i < len(lines):
        line = lines[i]
        lower = line.lower().strip("_ ").strip()
        for key, country in country_map.items():
            if lower == key or lower.startswith(key):
                current_country = country
                break

        url_match = re.match(r"^(https?://\S+)$", line)
        if url_match and rows:
            prev = rows[-1]
            if not prev.website:
                prev.website = url_match.group(1)
            i += 1
            continue

        if not line or line.startswith("http") or lower.startswith("table of contents"):
            i += 1
            continue
        if lower.startswith("see full guide") or lower.startswith("additional guides"):
            i += 1
            continue
        if re.match(r"^[_\-=]+$", line):
            i += 1
            continue

        if "." in line and len(line) > 8 and not line.startswith("http"):
            name_part = line.split(".")[0].strip()
            if len(name_part) >= 3 and not name_part.lower().startswith("update"):
                name = name_part
                desc = line[len(name_part) + 1 :].strip()
                website = None
                j = i + 1
                while j < len(lines) and not lines[j]:
                    j += 1
                if j < len(lines) and lines[j].startswith("http"):
                    website = lines[j].strip()
                rows.append(
                    RawPlace(
                        name=name,
                        address=desc,
                        website=website,
                        tradition=map_tradition(None, name, current_country),
                        faith=infer_faith(name),
                        type=infer_type(name),
                        folder=f"Wolf K Asia Retreats ({current_country})",
                        geocode_query=f"{name}, {desc}, {current_country}",
                        source="wolf-k-dharma-list",
                    )
                )
        i += 1

    return rows


def parse_wolf_k() -> list[RawPlace]:
    path = SOURCES_DIR / "wolf-k-dharma-retreat-list.txt"
    if not path.exists():
        return []
    return parse_wolf_k_text(path.read_text())


def parse_buddhanet_entry(block: str, country: str) -> RawPlace | None:
    name_match = re.search(r'class="entryName">\s*(.*?)\s*</p>', block, re.S)
    if not name_match:
        return None
    name = unescape(re.sub(r"\s+", " ", name_match.group(1))).strip()
    if not name:
        return None

    def field(label: str) -> str | None:
        match = re.search(rf"<strong>{label}:</strong>\s*(.*?)(?:<br|<strong>|$)", block, re.S | re.I)
        if not match:
            return None
        value = unescape(re.sub(r"<[^>]+>", " ", match.group(1)))
        value = re.sub(r"\s+", " ", value).strip()
        return value or None

    address = field("Address") or ""
    tradition_raw = field("Tradition")
    phone = field("Phone")
    website = extract_website(block)
    tradition = map_tradition(tradition_raw, name)

    return RawPlace(
        name=name,
        address=address,
        phone=phone,
        website=website,
        tradition=tradition,
        faith="Buddhist",
        type=infer_type(name),
        folder=f"BuddhaNet ({country})",
        geocode_query=f"{name}, {address}, {country}" if address else f"{name}, {country}",
        source="buddhanet.info",
    )


def scrape_buddhanet() -> list[RawPlace]:
    cache_path = SOURCES_DIR / "buddhanet-scrape.json"
    if cache_path.exists():
        cached = load_json(cache_path)
        print(f"  Using cached BuddhaNet scrape ({len(cached)} entries)")
        return [
            RawPlace(
                name=row["name"],
                address=row.get("address") or "",
                phone=row.get("phone"),
                website=row.get("website"),
                tradition=row.get("tradition") or "Buddhist",
                type=row.get("type") or infer_type(row["name"]),
                folder=row.get("folder") or "BuddhaNet",
                geocode_query=row.get("geocode_query") or row["name"],
                source="buddhanet.info",
            )
            for row in cached
        ]

    html = fetch_url("http://www.buddhanet.info/wbd/search2.php")
    country_select = re.search(
        r'<select name="country_id"[^>]*>(.*?)</select>', html, re.S
    )
    if not country_select:
        raise RuntimeError("Could not find BuddhaNet country list")
    countries = {
        m.group(1): m.group(2).strip()
        for m in re.finditer(
            r'<option value="(\d+)"[^>]*>([^<]+)</option>', country_select.group(1)
        )
        if m.group(1) != "0"
    }

    rows: list[RawPlace] = []
    for cid in sorted(countries, key=lambda x: int(x)):
        country = countries[cid]
        offset = 0
        total = None
        while True:
            url = f"http://www.buddhanet.info/wbd/country.php?country_id={cid}&offset={offset}"
            time.sleep(BUDDHANET_DELAY)
            page = fetch_url(url)
            if total is None:
                match = re.search(r"There were (\d+) results", page)
                total = int(match.group(1)) if match else 0
                if total == 0:
                    break

            blocks = re.findall(
                r'<p class="entryName">.*?</p>\s*<p class="entryDetail">.*?(?=<p class="entryName">|<p>\s*&nbsp;\s*<i><a href="/wbd/country|$)',
                page,
                re.S,
            )
            if not blocks:
                break
            for block in blocks:
                entry = parse_buddhanet_entry(block, country)
                if entry:
                    rows.append(entry)
            offset += 25
            if offset >= total:
                break

        if total:
            parsed = sum(1 for r in rows if r.folder == f"BuddhaNet ({country})")
            print(f"  BuddhaNet {country}: {total} listed, {parsed} parsed")

    save_json(
        cache_path,
        [
            {
                "name": r.name,
                "address": r.address,
                "phone": r.phone,
                "website": r.website,
                "tradition": r.tradition,
                "type": r.type,
                "folder": r.folder,
                "geocode_query": r.geocode_query,
            }
            for r in rows
        ],
    )
    print(f"  Cached {len(rows)} BuddhaNet entries to {cache_path.name}")
    return rows


def place_id(name: str, lat: float, lng: float) -> str:
    key = f"{name}|{lat:.4f}|{lng:.4f}"
    return hashlib.md5(key.encode()).hexdigest()[:12]


def merge_raw(into: RawPlace, new: RawPlace) -> None:
    if not into.address and new.address:
        into.address = new.address
    if not into.phone and new.phone:
        into.phone = new.phone
    if not into.website and new.website:
        into.website = new.website
    if not into.schools and new.schools:
        into.schools = new.schools
    if into.tradition == "Buddhist" and new.tradition != "Buddhist":
        into.tradition = new.tradition


def dedupe_key(raw: RawPlace) -> str | None:
    site = normalize_website(raw.website)
    if site:
        return f"site:{site}"
    name = normalize_name(raw.name)
    if name:
        return f"name:{name}|{normalize_name(raw.address)[:40]}"
    return None


def raw_to_place(raw: RawPlace, lat: float, lng: float) -> dict:
    return {
        "id": place_id(raw.name, lat, lng),
        "name": raw.name,
        "lat": lat,
        "lng": lng,
        "tradition": raw.tradition,
        "faith": raw.faith,
        "type": raw.type,
        "folder": raw.folder,
        "address": raw.address,
        "phone": raw.phone,
        "website": raw.website,
        **({"schools": raw.schools} if raw.schools else {}),
    }


def regeocode_stacked_places(*, allow_api: bool, min_cluster: int = 2) -> None:
    """Re-geocode places that share coordinates (country/region centroid stacking)."""
    dataset = load_json(PLACES_PATH)
    places: list[dict] = list(dataset.get("places", []))

    clusters: dict[str, list[int]] = {}
    for idx, place in enumerate(places):
        key = f"{place['lat']:.4f},{place['lng']:.4f}"
        clusters.setdefault(key, []).append(idx)

    stacked_indices: list[int] = []
    for indices in clusters.values():
        if len(indices) >= min_cluster:
            stacked_indices.extend(indices)

    if not stacked_indices:
        print("No stacked coordinate clusters found.")
        return

    query_to_indices: dict[str, list[int]] = {}
    for place_idx in stacked_indices:
        place = places[place_idx]
        query = geocode_query_for_place(place)
        query_to_indices.setdefault(query, []).append(place_idx)

    geocode_cache = load_geocode_cache()
    updated = 0
    unchanged = 0
    failed = 0
    api_calls = 0
    total_queries = len(query_to_indices)

    print(
        f"Re-geocoding {len(stacked_indices)} places "
        f"({total_queries} unique queries, clusters of {min_cluster}+, "
        f"allow_api={allow_api})…"
    )

    for idx, (query, place_indices) in enumerate(sorted(query_to_indices.items()), start=1):
        folder = places[place_indices[0]].get("folder") or ""
        country_code = country_from_folder(folder)
        had_cache = cache_lookup(geocode_cache, query) is not None
        coords = geocode_api(query, geocode_cache, country_code, allow_api=allow_api)

        if allow_api and not had_cache:
            api_calls += 1

        if not coords:
            failed += len(place_indices)
        else:
            for place_idx in place_indices:
                place = places[place_idx]
                if coords[0] == place["lat"] and coords[1] == place["lng"]:
                    unchanged += 1
                else:
                    place["lat"] = coords[0]
                    place["lng"] = coords[1]
                    updated += 1

        if idx % 25 == 0 or idx == total_queries:
            print(
                f"  {idx}/{total_queries} queries — updated {updated}, "
                f"unchanged {unchanged}, failed {failed}, api calls {api_calls}"
            )
            save_json(GEOCODE_CACHE_PATH, geocode_cache)

    dataset["places"] = places
    dataset["count"] = len(places)
    save_json(PLACES_PATH, dataset)
    save_json(GEOCODE_CACHE_PATH, geocode_cache)

    print("\nRe-geocode complete.")
    print(f"  Updated: {updated}")
    print(f"  Unchanged: {unchanged}")
    print(f"  Failed: {failed}")
    print(f"  API calls: {api_calls}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Import directory sources into places.json")
    parser.add_argument(
        "--no-api",
        action="store_true",
        help="Only use geocode cache; skip new Nominatim requests",
    )
    parser.add_argument(
        "--skip-buddhanet",
        action="store_true",
        help="Skip BuddhaNet bulk import (faster; other sources only)",
    )
    parser.add_argument(
        "--regeocode-stacked",
        action="store_true",
        help="Re-geocode places that share coordinates (fixes map stacking)",
    )
    parser.add_argument(
        "--min-cluster",
        type=int,
        default=2,
        help="Minimum places sharing coords to re-geocode (default: 2)",
    )
    args = parser.parse_args()
    allow_api = not args.no_api

    if args.regeocode_stacked:
        regeocode_stacked_places(allow_api=allow_api, min_cluster=args.min_cluster)
        return

    print("Loading existing places…")
    dataset = load_json(PLACES_PATH)
    existing_places: list[dict] = list(dataset.get("places", []))
    existing_by_site: dict[str, dict] = {}
    existing_by_name: dict[str, dict] = {}
    for place in existing_places:
        site = normalize_website(place.get("website"))
        if site:
            existing_by_site[site] = place
        existing_by_name[normalize_name(place["name"])] = place

    print("Parsing local source files…")
    incoming: list[RawPlace] = []
    incoming.extend(parse_tibetoffice())
    incoming.extend(parse_dhamma_org())
    incoming.extend(parse_hindu_ashrams())
    incoming.extend(parse_wolf_k())
    print(f"  Local sources: {len(incoming)} raw entries")

    print("Loading BuddhaNet…")
    if not args.skip_buddhanet:
        incoming.extend(scrape_buddhanet())
    else:
        print("  Skipped (--skip-buddhanet)")
    print(f"  Total raw entries before dedupe: {len(incoming)}")

    deduped: dict[str, RawPlace] = {}
    for raw in incoming:
        key = dedupe_key(raw)
        if not key:
            key = f"fallback:{normalize_name(raw.name)}|{raw.folder}"
        if key in deduped:
            merge_raw(deduped[key], raw)
        else:
            deduped[key] = raw

    print(f"  Unique imported entries: {len(deduped)}")

    to_import: list[RawPlace] = []
    merged_existing = 0
    for raw in deduped.values():
        site = normalize_website(raw.website)
        if site and site in existing_by_site:
            existing = existing_by_site[site]
            if not existing.get("phone") and raw.phone:
                existing["phone"] = raw.phone
            if not existing.get("website") and raw.website:
                existing["website"] = raw.website
            if not existing.get("address") and raw.address:
                existing["address"] = raw.address
            merged_existing += 1
            continue

        norm_name = normalize_name(raw.name)
        if norm_name in existing_by_name:
            existing = existing_by_name[norm_name]
            if raw.address and existing.get("address"):
                if raw.address[:20] in existing["address"] or existing["address"][:20] in raw.address:
                    merged_existing += 1
                    continue
            elif not raw.address:
                merged_existing += 1
                continue

        to_import.append(raw)

    print(f"  New entries to import: {len(to_import)} (merged into existing: {merged_existing})")

    geocode_cache = load_geocode_cache()
    locality_coords = build_locality_coords(
        to_import, geocode_cache, allow_api=allow_api
    )

    merged_ids = {p["id"] for p in existing_places}
    added_places: list[dict] = []
    skipped_geocode = 0

    for raw in to_import:
        coords = coords_for_raw(raw, geocode_cache, locality_coords)
        if not coords:
            skipped_geocode += 1
            continue
        lat, lng = coords
        place = raw_to_place(raw, lat, lng)
        if place["id"] in merged_ids:
            continue
        added_places.append(place)
        merged_ids.add(place["id"])
        site = normalize_website(raw.website)
        if site:
            existing_by_site[site] = place
        existing_by_name[normalize_name(place["name"])] = place

    print("Writing places.json…")
    write_places(existing_places, added_places)
    save_json(GEOCODE_CACHE_PATH, geocode_cache)

    total = len(existing_places) + len(added_places)
    print("\nDone.")
    print(f"  Existing kept: {len(existing_places)}")
    print(f"  New places added: {len(added_places)}")
    print(f"  Merged into existing (by website/name): {merged_existing}")
    print(f"  Skipped (no coordinates): {skipped_geocode}")
    print(f"  Total in database: {total}")
    if skipped_geocode and not allow_api:
        print("  Tip: re-run without --no-api to geocode remaining entries")


if __name__ == "__main__":
    main()
