#!/usr/bin/env python3
"""Enrich places from Google Places API (New): contact, hours, description, photo, coords."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib.google_places import (
    CACHE_PATH,
    PHOTOS_DIR,
    download_place_photo,
    fetch_place_data,
    get_api_key,
    load_cache,
    save_cache,
)
from lib.place_descriptions import is_substantive
from lib.place_utils import audit_flags, is_bad_website, load_places, save_places


def can_write_field(place: dict, field: str, force: bool) -> bool:
    verified = set(place.get("verifiedFields") or [])
    return force or field not in verified


def apply_google_data(
    place: dict,
    data,
    *,
    force: bool,
    download_photos: bool,
) -> list[str]:
    updated: list[str] = []
    if not data.matched:
        return updated

    if data.google_place_id and can_write_field(place, "googlePlaceId", force):
        place["googlePlaceId"] = data.google_place_id
        updated.append("googlePlaceId")

    if data.formatted_address and can_write_field(place, "address", force):
        place["address"] = data.formatted_address
        updated.append("address")

    if data.lat is not None and data.lng is not None and can_write_field(place, "coords", force):
        place["lat"] = data.lat
        place["lng"] = data.lng
        place["coordPrecision"] = "address"
        updated.append("coords")

    if data.phone and can_write_field(place, "phone", force):
        place["phone"] = data.phone
        updated.append("phone")

    if data.website and can_write_field(place, "website", force) and not is_bad_website(data.website):
        place["website"] = data.website
        updated.append("website")

    if data.google_maps_uri and can_write_field(place, "googleMapsUri", force):
        place["googleMapsUri"] = data.google_maps_uri
        updated.append("googleMapsUri")

    if data.opening_hours and can_write_field(place, "openingHours", force):
        place["openingHours"] = data.opening_hours
        updated.append("openingHours")

    if (
        data.description
        and is_substantive(data.description)
        and can_write_field(place, "description", force)
    ):
        place["description"] = data.description[:500]
        place["descriptionSource"] = "google_places"
        updated.append("description")

    if data.rating is not None and can_write_field(place, "googleRating", force):
        place["googleRating"] = data.rating
        updated.append("googleRating")

    if data.rating_count is not None and can_write_field(place, "googleRatingCount", force):
        place["googleRatingCount"] = data.rating_count
        updated.append("googleRatingCount")

    if data.business_status and can_write_field(place, "businessStatus", force):
        place["businessStatus"] = data.business_status
        updated.append("businessStatus")

    if data.primary_type and can_write_field(place, "googlePrimaryType", force):
        place["googlePrimaryType"] = data.primary_type
        updated.append("googlePrimaryType")

    if download_photos and data.photo_name and can_write_field(place, "photo", force):
        dest = PHOTOS_DIR / place["id"]
        local = download_place_photo(data.photo_name, dest)
        if local:
            place["photo"] = local
            place["photoSource"] = "google_places"
            updated.append("photo")

    flags = set(place.get("qualityFlags") or [])
    flags.discard("missing_address")
    flags.discard("missing_phone")
    flags.discard("missing_website")
    flags.discard("bad_website")
    flags.discard("missing_description")
    flags.discard("missing_photo")
    flags.discard("missing_hours")
    flags.discard("stacked_coords")
    place["qualityFlags"] = list(flags)

    sources = place.get("dataSource") or place.get("folder") or ""
    if "google_places" not in sources:
        place["dataSource"] = f"{sources}; google_places".strip("; ")

    return updated


def main() -> None:
    parser = argparse.ArgumentParser(description="Enrich places from Google Places API")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--force", action="store_true", help="Overwrite verified fields")
    parser.add_argument("--skip-photos", action="store_true")
    parser.add_argument("--only-missing", action="store_true", help="Skip rows with googlePlaceId")
    parser.add_argument(
        "--only-missing-photo",
        action="store_true",
        help="Only places without a photo (includes Google Discovery rows)",
    )
    args = parser.parse_args()

    if not get_api_key():
        print("GOOGLE_PLACES_API_KEY is not set in .env.local")
        sys.exit(1)

    payload, places = load_places()
    cache = load_cache()

    targets = list(places)
    if args.only_missing_photo:
        targets = [p for p in targets if not p.get("photo")]
    elif args.only_missing:
        targets = [p for p in targets if not p.get("googlePlaceId")]
    if args.limit:
        targets = targets[:args.limit]

    print(f"Google enriching {len(targets)} places (photos={not args.skip_photos})")

    matched = 0
    updated_count = 0
    photo_count = 0

    for idx, place in enumerate(targets, start=1):
        place_id = place["id"]
        cached = cache.get(place_id)
        if (
            cached
            and cached.get("matched")
            and args.only_missing
            and not args.only_missing_photo
            and not args.force
        ):
            continue
        if args.only_missing_photo and place.get("photo") and not args.force:
            continue

        data = fetch_place_data(
            place.get("name") or "",
            place.get("address"),
            place.get("lat"),
            place.get("lng"),
        )

        cache[place_id] = {
            "matched": data.matched,
            "googlePlaceId": data.google_place_id,
            "name": data.name,
        }

        if data.matched:
            matched += 1
            fields = apply_google_data(
                place,
                data,
                force=args.force,
                download_photos=not args.skip_photos,
            )
            if fields:
                updated_count += 1
            if "photo" in fields:
                photo_count += 1

        place["qualityFlags"] = audit_flags(place)

        if idx % 10 == 0:
            save_cache(cache)
            save_places(payload, places)
            print(
                f"  {idx}/{len(targets)} — matched {matched}, updated {updated_count}, photos {photo_count}",
                flush=True,
            )

    save_cache(cache)
    save_places(payload, places)

    print(f"Done: matched {matched}/{len(targets)}, updated {updated_count}, photos {photo_count}")
    print(f"Cache: {CACHE_PATH}")


if __name__ == "__main__":
    main()
