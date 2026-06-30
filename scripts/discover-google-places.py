#!/usr/bin/env python3
"""
Discover new Buddhist / Hindu-adjacent centers via Google Places Text Search.

Complements directory imports (BuddhaNet, dhamma.org, etc.) by finding venues
Google knows about that are missing from our dataset — especially in Europe,
Asia, Africa, and the Middle East.

Uses three complementary strategies per metro area:
  1. Text Search — many tradition-specific queries (paginated, up to ~60/query)
  2. Metro grid — 3×3 sub-regions to beat single-point result caps
  3. Nearby Search — buddhist_temple + hindu_temple primary types (20/call)

Usage:
  python3 scripts/discover-google-places.py --dry-run --region europe --limit-cells 1
  python3 scripts/discover-google-places.py --region asia --region africa
  python3 scripts/discover-google-places.py --full
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib.discovery_regions import (
    NEARBY_PRIMARY_TYPES,
    SearchCell,
    SearchPoint,
    cells_for_regions,
    queries_for_cell,
    search_points_for_cell,
)
from lib.google_places import get_api_key, search_nearby_in_region, text_search_in_region
from lib.place_discovery import PlaceIndex, build_place_record
from lib.place_utils import load_places, save_places

ROOT = Path(__file__).resolve().parent.parent
CACHE_PATH = ROOT / "scripts/google-discovery-cache.json"


def load_cache() -> dict:
    if CACHE_PATH.exists():
        return json.loads(CACHE_PATH.read_text())
    return {"completed": {}, "stats": {}}


def save_cache(cache: dict) -> None:
    CACHE_PATH.write_text(json.dumps(cache, indent=2) + "\n")


def cache_key(cell: SearchCell, point: SearchPoint, mode: str, query: str) -> str:
    return f"{cell.region}|{cell.country_code}|{point.label}|{mode}|{query}"


def ingest_results(
    raw_results: list[dict],
    *,
    cell: SearchCell,
    index: PlaceIndex,
    added: list[dict],
    working: list[dict],
    seen_google_ids: set[str],
    include_closed: bool,
) -> tuple[int, int, int, int]:
    """Returns (raw_count, relevant_count, new_count, dup_count)."""
    raw_count = 0
    relevant_count = 0
    new_count = 0
    dup_count = 0

    for raw in raw_results:
        raw_count += 1
        gid = raw.get("id")
        if gid and gid in seen_google_ids:
            dup_count += 1
            continue

        if not include_closed and raw.get("businessStatus") == "CLOSED_PERMANENTLY":
            continue

        record = build_place_record(
            raw,
            cell_name=cell.name,
            cell_country=cell.country,
            cell_region=cell.region,
        )
        if not record:
            continue

        relevant_count += 1
        if index.is_duplicate(record):
            dup_count += 1
            if gid:
                seen_google_ids.add(gid)
            continue

        if gid:
            seen_google_ids.add(gid)
        added.append(record)
        index.add(record)
        working.append(record)
        new_count += 1

    return raw_count, relevant_count, new_count, dup_count


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Discover dharma centers via Google Places (regional Text Search)",
    )
    parser.add_argument(
        "--region",
        action="append",
        dest="regions",
        metavar="NAME",
        help="Europe, Asia, Africa, Middle East, or all (repeatable)",
    )
    parser.add_argument(
        "--limit-cells",
        type=int,
        default=0,
        help="Max search cells to process (0 = all in selected regions)",
    )
    parser.add_argument(
        "--limit-queries",
        type=int,
        default=0,
        help="Max text queries per grid point (0 = all)",
    )
    parser.add_argument(
        "--grid",
        type=int,
        default=3,
        help="Grid size per metro (3 = 3×3 sub-searches; 1 = center only)",
    )
    parser.add_argument(
        "--no-nearby",
        action="store_true",
        help="Skip Nearby Search pass (buddhist_temple / hindu_temple)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Search and report matches without writing places.json",
    )
    parser.add_argument(
        "--full",
        action="store_true",
        help="Process all cells, queries, and grid points",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-run completed cell+query pairs (ignore cache)",
    )
    parser.add_argument(
        "--include-closed",
        action="store_true",
        help="Include permanently closed businesses",
    )
    args = parser.parse_args()

    if not get_api_key():
        print("GOOGLE_PLACES_API_KEY is not set in .env.local")
        sys.exit(1)

    grid_size = max(1, args.grid)
    cells = cells_for_regions(args.regions or ["all"])
    if args.limit_cells and not args.full:
        cells = cells[: args.limit_cells]

    payload, places = load_places()
    index = PlaceIndex(places)
    working = list(places)
    cache = load_cache()
    completed: dict[str, bool] = cache.setdefault("completed", {})
    seen_google_ids: set[str] = {
        p["googlePlaceId"] for p in places if p.get("googlePlaceId")
    }

    sample_queries = len(queries_for_cell(cells[0])) if cells else 0
    if args.limit_queries and not args.full:
        sample_queries = min(sample_queries, args.limit_queries)
    points_per_cell = grid_size * grid_size if grid_size > 1 else 1
    modes_per_point = sample_queries + (0 if args.no_nearby else len(NEARBY_PRIMARY_TYPES))

    print(
        f"Discovering across {len(cells)} metros, {points_per_cell} grid points each, "
        f"~{modes_per_point} searches/point ({sample_queries} text + "
        f"{0 if args.no_nearby else len(NEARBY_PRIMARY_TYPES)} nearby)"
    )
    print(f"Existing places: {len(places)}")

    api_calls = 0
    raw_hits = 0
    relevant_hits = 0
    skipped_dup = 0
    added: list[dict] = []
    added_before_cell = 0

    for cell_idx, cell in enumerate(cells, start=1):
        cell_queries = list(queries_for_cell(cell))
        if args.limit_queries and not args.full:
            cell_queries = cell_queries[: args.limit_queries]

        points = search_points_for_cell(cell, grid_size=grid_size)

        for point in points:
            for query in cell_queries:
                key = cache_key(cell, point, "text", query)
                if completed.get(key) and not args.force:
                    continue

                results, search_ok = text_search_in_region(
                    query,
                    point.lat,
                    point.lng,
                    radius_km=point.radius_km,
                    region_code=cell.country_code,
                )
                api_calls += 1
                if not args.dry_run and search_ok:
                    completed[key] = True

                raw_n, rel_n, new_n, dup_n = ingest_results(
                    results,
                    cell=cell,
                    index=index,
                    added=added,
                    working=working,
                    seen_google_ids=seen_google_ids,
                    include_closed=args.include_closed,
                )
                raw_hits += raw_n
                relevant_hits += rel_n
                skipped_dup += dup_n

                if api_calls % 5 == 0:
                    if not args.dry_run:
                        save_cache(cache)
                    if not args.dry_run and added:
                        save_places(payload, working)
                    print(
                        f"  [{cell_idx}/{len(cells)}] {cell.name} @ {point.label}: "
                        f"api={api_calls} new={len(added)}",
                        flush=True,
                    )

            if not args.no_nearby:
                for primary_type in NEARBY_PRIMARY_TYPES:
                    key = cache_key(cell, point, "nearby", primary_type)
                    if completed.get(key) and not args.force:
                        continue

                    results, search_ok = search_nearby_in_region(
                        point.lat,
                        point.lng,
                        radius_km=point.radius_km,
                        included_primary_types=(primary_type,),
                        region_code=cell.country_code,
                    )
                    api_calls += 1
                    if not args.dry_run and search_ok:
                        completed[key] = True

                    raw_n, rel_n, new_n, dup_n = ingest_results(
                        results,
                        cell=cell,
                        index=index,
                        added=added,
                        working=working,
                        seen_google_ids=seen_google_ids,
                        include_closed=args.include_closed,
                    )
                    raw_hits += raw_n
                    relevant_hits += rel_n
                    skipped_dup += dup_n

                    if api_calls % 5 == 0:
                        if not args.dry_run:
                            save_cache(cache)
                        if not args.dry_run and added:
                            save_places(payload, working)
                        print(
                            f"  [{cell_idx}/{len(cells)}] {cell.name} @ {point.label}: "
                            f"api={api_calls} new={len(added)}",
                            flush=True,
                        )

        cell_new = len(added) - added_before_cell
        added_before_cell = len(added)
        print(
            f"  Done {cell.name}: +{cell_new} new (running total {len(added)})",
            flush=True,
        )

    cache["stats"] = {
        "api_calls": api_calls,
        "raw_hits": raw_hits,
        "relevant_hits": relevant_hits,
        "added": len(added),
        "skipped_duplicate": skipped_dup,
        "grid_size": grid_size,
    }
    if not args.dry_run:
        save_cache(cache)

    if args.dry_run:
        print("\nDry run — sample of discoveries:")
        for place in added[:20]:
            print(f"  + {place['name']} ({place['folder']}) — {place.get('address', '')[:60]}")
        if len(added) > 20:
            print(f"  … and {len(added) - 20} more")
    else:
        working.sort(key=lambda p: p["name"].lower())
        save_places(payload, working)
        print(f"Wrote {len(added)} new places → {len(working)} total")

    print("\nDiscovery complete.")
    print(f"  API searches:     {api_calls}")
    print(f"  Raw results:      {raw_hits}")
    print(f"  Relevant:         {relevant_hits}")
    print(f"  New places:       {len(added)}")
    print(f"  Skipped (dup):    {skipped_dup}")
    print(f"  Cache:            {CACHE_PATH}")


if __name__ == "__main__":
    main()
