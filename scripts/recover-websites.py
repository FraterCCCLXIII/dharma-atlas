#!/usr/bin/env python3
"""Recover websites from OSM Overpass and optional Google Places."""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib.place_utils import is_bad_website, load_places, save_places
from lib.source_urls import (
    apply_recovered_website,
    build_buddhanet_index,
    build_dhamma_index,
    extract_urls_from_text,
    google_places_website,
    match_buddhanet_url,
    match_dhamma_url,
    needs_website_recovery,
    overpass_website,
    scrape_dhamma_maps_urls,
    should_skip_overpass,
)


def main() -> None:
    parser = argparse.ArgumentParser(description="Recover place websites")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument(
        "--skip-overpass",
        action="store_true",
        help="Only use Google Places (requires API key)",
    )
    parser.add_argument(
        "--skip-google",
        action="store_true",
        help="Skip Google Places lookup",
    )
    args = parser.parse_args()

    has_google = bool(
        os.environ.get("GOOGLE_PLACES_API_KEY") or os.environ.get("GOOGLE_GEOCODING_API_KEY")
    )
    use_google = has_google and not args.skip_google

    dhamma_index = build_dhamma_index(scrape_dhamma_maps_urls(allow_fetch=False))
    buddhanet_index = build_buddhanet_index()

    payload, places = load_places()
    targets = [p for p in places if needs_website_recovery(p)]
    if args.limit:
        targets = targets[:args.limit]

    print(
        f"Recovering websites for {len(targets)} places "
        f"(overpass={not args.skip_overpass}, google={use_google})"
    )
    recovered = 0
    cleared = 0
    by_source: dict[str, int] = {}

    for idx, place in enumerate(targets, start=1):
        if not needs_website_recovery(place):
            continue

        if is_bad_website(place.get("website")):
            place["website"] = None
            cleared += 1

        folder = place.get("folder") or ""
        name = place.get("name") or ""
        address = place.get("address") or ""
        lat, lng = place.get("lat"), place.get("lng")
        url = None
        source = ""

        if folder.startswith("Goenka Vipassana"):
            url = match_dhamma_url(name, dhamma_index)
            if url:
                source = "dhamma.org"

        if not url and folder.startswith("BuddhaNet"):
            url = match_buddhanet_url(name, folder, buddhanet_index)
            if url:
                source = "buddhanet"
            else:
                for candidate in extract_urls_from_text(address):
                    url = candidate
                    source = "buddhanet-address"
                    break

        if not url and not args.skip_overpass and lat is not None and lng is not None:
            if not should_skip_overpass(place):
                url = overpass_website(lat, lng, name)
                if url:
                    source = "osm"

        if not url and use_google:
            url = google_places_website(name, lat, lng, address)
            if url:
                source = "google-places"

        if url and not is_bad_website(url):
            apply_recovered_website(place, url)
            recovered += 1
            by_source[source] = by_source.get(source, 0) + 1

        if idx % 10 == 0:
            save_places(payload, places)
            print(f"  {idx}/{len(targets)} — recovered {recovered}", flush=True)

    save_places(payload, places)
    print(f"Done: recovered {recovered}, cleared bad URLs {cleared}")
    for src, count in sorted(by_source.items()):
        print(f"  {src}: {count}")
    if not use_google and not args.skip_google:
        print("  Tip: set GOOGLE_PLACES_API_KEY for higher recovery rates")


if __name__ == "__main__":
    main()
