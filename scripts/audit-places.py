#!/usr/bin/env python3
"""Audit places.json and write reports/places-audit.json + places-audit.csv."""

from __future__ import annotations

import csv
import json
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib.place_utils import audit_flags, load_places, REPORTS_DIR


def main() -> None:
    payload, places = load_places()
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    rows = []
    flag_counts: Counter[str] = Counter()

    for place in places:
        flags = audit_flags(place)
        for flag in flags:
            flag_counts[flag] += 1
        rows.append(
            {
                "id": place["id"],
                "name": place["name"],
                "folder": place.get("folder", ""),
                "flags": flags,
                "flag_count": len(flags),
                "website": place.get("website"),
                "coord_precision": place.get("coordPrecision", "unknown"),
            }
        )

    report = {
        "total": len(places),
        "flag_counts": dict(flag_counts),
        "places": rows,
    }

    json_path = REPORTS_DIR / "places-audit.json"
    csv_path = REPORTS_DIR / "places-audit.csv"
    json_path.write_text(json.dumps(report, indent=2) + "\n")

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["id", "name", "folder", "flag_count", "flags", "website", "coord_precision"],
        )
        writer.writeheader()
        for row in rows:
            writer.writerow(
                {
                    "id": row["id"],
                    "name": row["name"],
                    "folder": row["folder"],
                    "flag_count": row["flag_count"],
                    "flags": ",".join(row["flags"]),
                    "website": row["website"] or "",
                    "coord_precision": row["coord_precision"],
                }
            )

    print(f"Audited {len(places)} places")
    for flag, count in flag_counts.most_common():
        print(f"  {flag}: {count}")
    print(f"Wrote {json_path}")
    print(f"Wrote {csv_path}")


if __name__ == "__main__":
    main()
