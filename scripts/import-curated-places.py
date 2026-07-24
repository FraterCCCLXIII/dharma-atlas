#!/usr/bin/env python3
"""Import a curated place list without Google Places API.

Geocodes via Nominatim, writes curated descriptions, then leaves photo
download to `npm run download-place-photos` (website/Wikipedia/Commons).

Usage:
  python3 scripts/import-curated-places.py tmp/san-diego-curated.json
  python3 scripts/import-curated-places.py tmp/san-diego-curated.json --dry-run
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib.place_discovery import PlaceIndex, haversine_m, normalize_name
from lib.place_utils import (
    GEOCODE_CACHE_PATH,
    USER_AGENT,
    audit_flags,
    is_bad_website,
    load_places,
    save_places,
)

ROOT = Path(__file__).resolve().parent.parent
NOMINATIM_DELAY = 1.1


def place_id(name: str, lat: float, lng: float) -> str:
    key = f"{name}|{lat:.4f}|{lng:.4f}"
    return hashlib.md5(key.encode()).hexdigest()[:12]


def load_geocode_cache() -> dict:
    if GEOCODE_CACHE_PATH.exists():
        return json.loads(GEOCODE_CACHE_PATH.read_text())
    return {}


def save_geocode_cache(cache: dict) -> None:
    GEOCODE_CACHE_PATH.write_text(json.dumps(cache, indent=2) + "\n")


def geocode(query: str, cache: dict) -> tuple[float, float, str] | None:
    key = query.strip().lower()
    cached = cache.get(key)
    if cached and cached.get("lat") is not None and cached.get("lng") is not None:
        return float(cached["lat"]), float(cached["lng"]), cached.get("display") or query

    params = {
        "q": query,
        "format": "json",
        "limit": "1",
        "addressdetails": "0",
        "countrycodes": "us",
    }
    url = f"https://nominatim.openstreetmap.org/search?{urllib.parse.urlencode(params)}"
    time.sleep(NOMINATIM_DELAY)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read())
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        print(f"  geocode error: {exc}")
        cache[key] = {"lat": None, "lng": None, "failed": True}
        return None

    if not data:
        cache[key] = {"lat": None, "lng": None, "failed": True}
        return None

    hit = data[0]
    lat = round(float(hit["lat"]), 6)
    lng = round(float(hit["lon"]), 6)
    display = hit.get("display_name") or query
    cache[key] = {"lat": lat, "lng": lng, "display": display}
    return lat, lng, display


def city_from_address(address: str) -> str:
    parts = [p.strip() for p in address.split(",") if p.strip()]
    for part in parts:
        if re.search(r"\bCA\b", part) and not re.match(r"^\d", part):
            # "San Diego, CA 92103" style already split; look at previous
            continue
        if re.fullmatch(r"CA(?:\s+\d{5}(?:-\d{4})?)?", part, re.I):
            idx = parts.index(part)
            if idx > 0:
                return parts[idx - 1]
    if len(parts) >= 2:
        return parts[-2]
    return "San Diego"


def description_for(entry: dict) -> str:
    name = entry["name"]
    address = entry.get("address") or ""
    city = city_from_address(address)
    tradition = entry.get("tradition") or "Buddhist"
    place_type = (entry.get("type") or "center").lower()
    faith = entry.get("faith") or "Buddhist"
    website = entry.get("website")

    # Place-specific blurbs when we know them well.
    special = {
        "Dharma Bum Temple": (
            "Lay Buddhist temple in University Heights offering free meditation, "
            "dharma talks, and community programs open to newcomers."
        ),
        "San Diego Buddhist Association (Hsi Fang Temple)": (
            "Chinese Mahayana temple on Park Boulevard with a peaceful worship hall "
            "and community programs for local sangha and visitors."
        ),
        "Buddhist Temple of San Diego": (
            "Historic Jodo Shinshu temple in San Diego serving a long-standing Pure Land "
            "community with Sunday services and cultural programs."
        ),
        "Sweetwater Zen Center": (
            "Residential Zen practice center in National City offering zazen, sesshin, "
            "and community practice in a residential sangha setting."
        ),
        "Self-Realization Fellowship Temple San Diego": (
            "SRF temple in Hillcrest offering meditation services, kriya yoga teachings, "
            "and fellowship in the lineage of Paramahansa Yogananda."
        ),
        "Deer Park Monastery": (
            "Mountain monastery in the Plum Village tradition of Thich Nhat Hanh, "
            "open for day visits, walking meditation, and retreats in Escondido."
        ),
        "Metta Forest Monastery": (
            "Thai Forest tradition monastery in Valley Center offering meditation, "
            "monastic practice, and periodic public teachings."
        ),
        "Kadampa Meditation Center San Diego": (
            "Kadampa Buddhist meditation center offering drop-in classes, guided "
            "meditations, and study programs on Adams Avenue."
        ),
        "Zen Center San Diego": (
            "Long-running Zen practice community in Pacific Beach offering sitting "
            "meditation, dharma talks, and instruction for new and experienced sitters."
        ),
        "Self-Realization Fellowship Meditation Gardens": (
            "Ocean-view meditation gardens at the Encinitas SRF hermitage, open to "
            "the public for quiet reflection and walking meditation."
        ),
        "Self-Realization Fellowship Encinitas Temple": (
            "SRF temple in Encinitas offering meditation services and programs in the "
            "lineage of Paramahansa Yogananda."
        ),
        "ISKCON Temple San Diego": (
            "Hare Krishna temple near Pacific Beach offering deity worship, kirtan, "
            "prasadam, and bhakti yoga community programs."
        ),
        "Krishna Lounge": (
            "Intimate Bhakti Yoga gathering space for spiritual seekers, with kirtan, "
            "community meals, and informal teaching near Grand Avenue."
        ),
        "Vedanta Society of Southern California": (
            "Ramakrishna Vedanta center in San Diego offering lectures, meditation, "
            "and study in the Vedanta tradition."
        ),
        "Insight San Diego": (
            "Insight/Vipassana sitting group offering mindfulness meditation practice "
            "and dharma community in San Diego."
        ),
        "Open Gate Zen Collective": (
            "Zen collective in Chula Vista offering onsite and online meditation "
            "practice and community gatherings."
        ),
        "Hidden Valley Zen Center (HVZC), Yuukoku-ji": (
            "Soto Zen practice center (Yuukoku-ji) in San Marcos offering zazen, "
            "services, and residential practice opportunities."
        ),
        "Trúc Lâm Đại Đăng Zen Monastery": (
            "Vietnamese Trúc Lâm Zen monastery in Bonsall set on hillside grounds "
            "with meditation halls and scenic vineyard views."
        ),
        "Dhammakaya Meditation Center San Diego": (
            "Dhammakaya meditation center in Lakeside offering guided meditation "
            "practice and community programs."
        ),
        "San Diego Shambhala Meditation Center": (
            "Shambhala meditation center offering sitting practice, study, and "
            "community programs in the Tibetan Buddhist Shambhala tradition."
        ),
        "SGI-USA San Marcos Center": (
            "Soka Gakkai International center in San Marcos for Nichiren Buddhist "
            "practice, study meetings, and community activities."
        ),
        "Buddha For You Gifts & Books": (
            "Buddhist bookstore and gift shop connected with Dharma Bum Temple, "
            "carrying books, statues, and practice supplies."
        ),
        "Ocean of Peace Meditation Hall": (
            "Large meditation hall at Deer Park Monastery used for sitting, walking "
            "meditation, and community gatherings in the Plum Village tradition."
        ),
        "Sri Chinmoy Peace Garden": (
            "Quiet public peace garden on Adams Avenue dedicated to meditation and "
            "contemplation in the spirit of Sri Chinmoy."
        ),
        "Art of Living San Diego": (
            "Art of Living center offering breathwork, meditation, and wellness "
            "programs rooted in yogic traditions."
        ),
        "Transcendental Meditation": (
            "Transcendental Meditation instruction center offering TM courses and "
            "follow-up support in San Diego."
        ),
        "Vista Buddhist Temple": (
            "Jodo Shinshu Pure Land temple in Vista serving the North County "
            "Buddhist community with services and cultural programs."
        ),
        "Buddhist Tzu Chi Foundation": (
            "Tzu Chi Foundation San Diego office supporting Buddhist compassion "
            "work, disaster relief, and community service programs."
        ),
    }
    if name in special:
        return special[name]

    if faith == "Hindu":
        base = (
            f"{name} is a Hindu {place_type} in {city}, offering community practice, "
            f"worship, and teachings in the {tradition} tradition."
        )
    elif "Wat Lao" in name or "Wat Thai" in name or "Wat Khemara" in name or "SOVANNKIRY" in name:
        base = (
            f"{name} is a Southeast Asian Buddhist temple in {city}, serving local "
            f"families with ceremonies, cultural gatherings, and community practice."
        )
    elif tradition == "Vietnamese" or "Chua" in name or "Chùa" in name or "Thiền" in name:
        base = (
            f"{name} is a Vietnamese Buddhist {place_type} in {city}, offering "
            f"devotional practice, meditation, and community ceremonies."
        )
    elif tradition == "Zen":
        base = (
            f"{name} is a Zen Buddhist {place_type} in {city}, offering sitting "
            f"meditation, instruction, and sangha practice."
        )
    elif tradition == "Tibetan":
        base = (
            f"{name} is a Tibetan Buddhist {place_type} in {city}, offering "
            f"meditation, study, and community practice."
        )
    else:
        base = (
            f"{name} is a {tradition} Buddhist {place_type} in {city}, offering "
            f"community practice, meditation, and teachings for visitors and sangha members."
        )

    if website and not is_bad_website(website):
        return base
    return base


def find_existing(index: PlaceIndex, places: list[dict], entry: dict, lat: float, lng: float) -> dict | None:
    name = normalize_name(entry["name"])
    # Exact / near-name within ~1.5km
    for p in places:
        pn = normalize_name(p.get("name") or "")
        if not pn:
            continue
        try:
            dist = haversine_m(lat, lng, float(p["lat"]), float(p["lng"]))
        except (TypeError, ValueError, KeyError):
            continue
        if dist > 1500:
            continue
        if pn == name or name[:12] in pn or pn[:12] in name:
            return p
        # Hsi Fang / His Fang variants
        if "hsi fang" in name and "fang" in pn and "san diego" in pn:
            return p
        if "hsi fang" in pn and "fang" in name:
            return p
    # Broader name match in San Diego County box
    for p in places:
        pn = normalize_name(p.get("name") or "")
        if pn == name:
            return p
    return None


def build_record(entry: dict, lat: float, lng: float, geocoded_address: str) -> dict:
    name = entry["name"]
    address = entry.get("address") or ""
    # Prefer street-level curated address when geocoder returns a long display_name.
    if address and re.search(r"\d", address):
        final_address = address if "CA" in address else f"{address}, USA"
        if not re.search(r"\bUSA\b|\bUnited States\b", final_address, re.I):
            # Keep as given; many already include CA zip.
            pass
    else:
        final_address = geocoded_address

    # Normalize incomplete addresses
    if address and re.search(r"\d", address) and "CA" in address.upper():
        final_address = address if address.endswith("USA") else (
            address if ", USA" in address else f"{address}, USA" if address.endswith("CA") or re.search(r"CA\s+\d{5}", address) else address
        )
        if re.search(r"CA\s+\d{5}", address) and not address.endswith("USA"):
            final_address = f"{address}, USA"

    record = {
        "id": place_id(name, lat, lng),
        "name": name,
        "lat": lat,
        "lng": lng,
        "tradition": entry.get("tradition") or "Buddhist",
        "faith": entry.get("faith") or "Buddhist",
        "type": entry.get("type") or "Center",
        "folder": "San Diego curated import",
        "address": final_address,
        "coordPrecision": "address" if re.search(r"\d", address or "") else "city",
        "dataSource": "san_diego_curated",
        "schools": entry.get("schools") or [],
        "description": description_for(entry),
        "descriptionSource": "curated_import",
        "isDraft": False,
        "qualityFlags": ["unverified_description"],
    }

    if entry.get("phone"):
        record["phone"] = entry["phone"]
    if entry.get("website") and not is_bad_website(entry["website"]):
        record["website"] = entry["website"]

    record["qualityFlags"] = audit_flags(record)
    return record


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("curated_json")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--out", default="tmp/san-diego-import-result.json")
    args = parser.parse_args()

    curated = json.loads(Path(args.curated_json).read_text())
    payload, places = load_places()
    index = PlaceIndex(places)
    cache = load_geocode_cache()

    added: list[dict] = []
    updated: list[dict] = []
    failed: list[dict] = []

    for idx, entry in enumerate(curated, start=1):
        name = entry["name"]
        address = entry.get("address") or "San Diego, CA"
        query = entry.get("query") or f"{name}, {address}"
        # Prefer street address geocode when available.
        if re.search(r"\d", address):
            geo_query = f"{address}, USA" if "USA" not in address.upper() else address
        else:
            geo_query = query

        print(f"[{idx}/{len(curated)}] {name}", flush=True)
        result = geocode(geo_query, cache)
        if not result and geo_query != query:
            result = geocode(query, cache)
        if not result:
            print("  FAIL: geocode")
            failed.append(entry)
            continue

        lat, lng, display = result
        # Soft sanity: San Diego County-ish
        if not (32.4 <= lat <= 33.6 and -117.7 <= lng <= -116.4):
            print(f"  WARN: coords outside SD county box ({lat},{lng}); retrying with name+address")
            result2 = geocode(f"{name}, {address}, California, USA", cache)
            if result2:
                lat, lng, display = result2
            if not (32.4 <= lat <= 33.6 and -117.7 <= lng <= -116.4):
                print("  FAIL: bad coords")
                failed.append(entry)
                continue

        existing = find_existing(index, places, entry, lat, lng)
        if existing:
            fields = []
            if not existing.get("description") or len(str(existing.get("description") or "")) < 40:
                existing["description"] = description_for(entry)
                existing["descriptionSource"] = "curated_import"
                fields.append("description")
            if entry.get("phone") and not existing.get("phone"):
                existing["phone"] = entry["phone"]
                fields.append("phone")
            if entry.get("website") and not existing.get("website") and not is_bad_website(entry["website"]):
                existing["website"] = entry["website"]
                fields.append("website")
            if entry.get("schools") and not existing.get("schools"):
                existing["schools"] = entry["schools"]
                fields.append("schools")
            if entry.get("tradition") and existing.get("tradition") in (None, "", "Buddhist") and entry["tradition"] != "Buddhist":
                existing["tradition"] = entry["tradition"]
                fields.append("tradition")
            if entry.get("type") and existing.get("type") != entry.get("type"):
                # keep existing type unless it's generic Center and curated is more specific
                if existing.get("type") == "Center" and entry.get("type") != "Center":
                    existing["type"] = entry["type"]
                    fields.append("type")
            sources = existing.get("dataSource") or ""
            if "san_diego_curated" not in sources:
                existing["dataSource"] = f"{sources}; san_diego_curated".strip("; ")
                fields.append("dataSource")
            existing["qualityFlags"] = audit_flags(existing)
            print(f"  UPDATE {existing['id']} ({', '.join(fields) or 'touch'})")
            updated.append(existing)
            continue

        record = build_record(entry, lat, lng, display)
        if args.dry_run:
            print(f"  DRY add {record['id']} @ {lat},{lng}")
        else:
            places.append(record)
            index.add(record)
            print(f"  ADD {record['id']} @ {lat},{lng}")
        added.append(record)

        if idx % 10 == 0:
            save_geocode_cache(cache)

    save_geocode_cache(cache)

    if not args.dry_run:
        payload["count"] = len(places)
        save_places(payload, places)

    out = {
        "added": [{"id": p["id"], "name": p["name"], "lat": p["lat"], "lng": p["lng"], "address": p.get("address"), "description": p.get("description"), "website": p.get("website")} for p in added],
        "updated": [{"id": p["id"], "name": p["name"]} for p in updated],
        "failed": failed,
        "addedCount": len(added),
        "updatedCount": len(updated),
        "failedCount": len(failed),
    }
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
    print(f"Done: added={len(added)} updated={len(updated)} failed={len(failed)} → {args.out}")


if __name__ == "__main__":
    main()
