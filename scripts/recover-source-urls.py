#!/usr/bin/env python3
"""Fast website recovery from dhamma.org maps and BuddhaNet scrape (no Overpass)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib.place_utils import is_bad_website, load_places, save_places
from lib.source_urls import (
    apply_recovered_website,
    build_buddhanet_index,
    build_dhamma_index,
    extract_urls_from_text,
    match_buddhanet_url,
    match_dhamma_url,
    needs_website_recovery,
    scrape_dhamma_maps_urls,
)


def main() -> None:
    parser = argparse.ArgumentParser(description="Recover websites from directory sources")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument(
        "--refresh-dhamma",
        action="store_true",
        help="Re-fetch dhamma.org maps page for URL index",
    )
    args = parser.parse_args()

    print("Loading source URL indexes…")
    dhamma_by_title = scrape_dhamma_maps_urls(allow_fetch=args.refresh_dhamma)
    dhamma_index = build_dhamma_index(dhamma_by_title)
    buddhanet_index = build_buddhanet_index()
    print(f"  dhamma.org titles: {len(dhamma_by_title)}")
    print(f"  buddhanet keys: {len(buddhanet_index)}")

    payload, places = load_places()
    targets = [p for p in places if needs_website_recovery(p)]
    if args.limit:
        targets = targets[:args.limit]

    print(f"Matching sources for {len(targets)} places")
    recovered = 0
    cleared = 0
    by_source: dict[str, int] = {}

    for idx, place in enumerate(targets, start=1):
        had_bad = is_bad_website(place.get("website"))
        if had_bad:
            place["website"] = None
            cleared += 1

        folder = place.get("folder") or ""
        name = place.get("name") or ""
        address = place.get("address") or ""
        url = None
        source = ""

        if folder.startswith("Goenka Vipassana"):
            url = match_dhamma_url(name, dhamma_index)
            source = "dhamma.org" if url else ""

        if not url and folder.startswith("BuddhaNet"):
            url = match_buddhanet_url(name, folder, buddhanet_index)
            source = "buddhanet" if url else ""
            if not url:
                for candidate in extract_urls_from_text(address):
                    url = candidate
                    source = "buddhanet-address"
                    break

        if url:
            apply_recovered_website(place, url)
            recovered += 1
            by_source[source] = by_source.get(source, 0) + 1

        if idx % 50 == 0:
            save_places(payload, places)
            print(f"  {idx}/{len(targets)} — recovered {recovered}", flush=True)

    save_places(payload, places)
    print(f"Done: recovered {recovered}, cleared bad URLs {cleared}")
    for src, count in sorted(by_source.items()):
        print(f"  {src}: {count}")


if __name__ == "__main__":
    main()
