#!/usr/bin/env python3
"""Deterministic place data cleanup: bad websites, encoding, phones, flags."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib.place_descriptions import is_substantive
from lib.place_utils import (
    audit_flags,
    fix_mojibake,
    infer_coord_precision,
    is_bad_website,
    load_places,
    normalize_phone,
    save_places,
)


def is_generated_photo(place: dict) -> bool:
    photo = place.get("photo") or ""
    if place.get("photoSource") == "generated":
        return True
    return "/places/generated/" in photo


def clean_place(place: dict) -> dict:
    place = dict(place)
    place["name"] = fix_mojibake(place.get("name", ""))
    place["address"] = fix_mojibake(place.get("address", ""))

    if is_bad_website(place.get("website")):
        place["website"] = None

    if place.get("description") and not is_substantive(place.get("description")):
        place["description"] = None
        place["descriptionSource"] = None

    if is_generated_photo(place):
        place["photo"] = None
        place["photoSource"] = None

    place["phone"] = normalize_phone(place.get("phone"))

    if not place.get("coordPrecision"):
        place["coordPrecision"] = infer_coord_precision(place.get("folder", ""))

    if not place.get("dataSource"):
        place["dataSource"] = place.get("folder", "")

    place["qualityFlags"] = audit_flags(place)
    return place


def main() -> None:
    parser = argparse.ArgumentParser(description="Clean places.json deterministically")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    payload, places = load_places()
    cleaned = [clean_place(p) for p in places]

    bad_web_before = sum(1 for p in places if is_bad_website(p.get("website")))
    bad_web_after = sum(1 for p in cleaned if is_bad_website(p.get("website")))

    print(f"Cleaned {len(cleaned)} places")
    print(f"  bad websites: {bad_web_before} → {bad_web_after}")

    if not args.dry_run:
        save_places(payload, cleaned)
        print(f"Wrote {len(cleaned)} places")


if __name__ == "__main__":
    main()
