#!/usr/bin/env python3
"""Fetch substantive place descriptions from websites, About pages, and Wikipedia."""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from html import unescape
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib.place_descriptions import is_substantive
from lib.place_utils import is_bad_website, load_places, save_places, USER_AGENT

ROOT = Path(__file__).resolve().parent.parent
DHAMMA_JSON = ROOT / "data/sources/dhamma-org-directory.json"

ABOUT_PATHS = [
    "/about",
    "/about-us",
    "/about_us",
    "/our-story",
    "/our-mission",
    "/welcome",
    "/who-we-are",
    "/the-center",
    "/center",
]


def clean_html_text(html: str) -> str:
    text = re.sub(r"<script[^>]*>.*?</script>", " ", html, flags=re.I | re.S)
    text = re.sub(r"<style[^>]*>.*?</style>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def extract_paragraphs(html: str) -> list[str]:
    chunks: list[str] = []
    for match in re.finditer(r"<p[^>]*>(.*?)</p>", html, flags=re.I | re.S):
        para = clean_html_text(match.group(1))
        if len(para) >= 60:
            chunks.append(para)
    if not chunks:
        for match in re.finditer(
            r"<(?:div|section|article)[^>]*class=[\"'][^\"']*(?:about|intro|mission|welcome)[^\"']*[\"'][^>]*>(.*?)</(?:div|section|article)>",
            html,
            flags=re.I | re.S,
        ):
            para = clean_html_text(match.group(1))
            if len(para) >= 80:
                chunks.append(para[:600])
    return chunks


def extract_meta_description(html: str) -> str | None:
    patterns = [
        r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']+)["\']',
        r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:description["\']',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']description["\']',
    ]
    for pattern in patterns:
        match = re.search(pattern, html, re.I | re.S)
        if match:
            text = unescape(re.sub(r"\s+", " ", match.group(1))).strip()
            if is_substantive(text):
                return text[:500]
    return None


def best_from_paragraphs(paragraphs: list[str]) -> str | None:
    for para in paragraphs:
        if is_substantive(para):
            # Prefer first substantive paragraph; cap length at ~2 sentences / 500 chars
            sentences = re.split(r"(?<=[.!?])\s+", para)
            out = ""
            for sentence in sentences:
                candidate = (out + " " + sentence).strip()
                if len(candidate) > 480:
                    break
                out = candidate
                if len(out) >= 120 and out.count(".") >= 1:
                    break
            return (out or para)[:500]
    return None


def fetch_url(url: str, timeout: int = 20) -> str | None:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.read().decode("utf-8", "replace")[:250000]
    except (urllib.error.URLError, TimeoutError, ValueError):
        return None


def resolve_url(base: str, path: str) -> str:
    return urllib.parse.urljoin(base if base.endswith("/") else base + "/", path.lstrip("/"))


def fetch_from_website(website: str) -> tuple[str | None, str]:
    parsed = urllib.parse.urlparse(website)
    base = f"{parsed.scheme}://{parsed.netloc}"

    for path in ABOUT_PATHS:
        about_html = fetch_url(resolve_url(base, path))
        time.sleep(0.25)
        if not about_html:
            continue
        about_body = best_from_paragraphs(extract_paragraphs(about_html))
        if about_body:
            return about_body, f"website-{path.strip('/') or 'about'}"

    html = fetch_url(website)
    if not html:
        return None, ""

    meta = extract_meta_description(html)
    if meta:
        return meta, "website-meta"

    paras = extract_paragraphs(html)
    body = best_from_paragraphs(paras)
    if body:
        return body, "website-home"

    return None, ""


def fetch_wikipedia_summary(name: str, place_type: str) -> tuple[str | None, str]:
    for title in [name, f"{name} {place_type}", f"{name} Buddhist temple"]:
        encoded = urllib.parse.quote(title)
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=15) as response:
                data = json.loads(response.read())
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            continue

        extract = (data.get("extract") or "").strip()
        if extract and is_substantive(extract):
            return extract[:500], "wikipedia"

    return None, ""


def load_dhamma_descriptions() -> dict[str, str]:
    if not DHAMMA_JSON.exists():
        return {}
    data = json.loads(DHAMMA_JSON.read_text())
    # dhamma.org directory JSON has no per-center descriptions; skip unless extended later
    return {}


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch substantive place descriptions")
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    payload, places = load_places()
    targets = [
        p
        for p in places
        if not p.get("description")
        or not is_substantive(p.get("description", ""))
    ]
    if args.limit:
        targets = targets[:args.limit]

    print(f"Fetching descriptions for {len(targets)} places")
    fetched = 0
    cleared = 0

    for idx, place in enumerate(targets, start=1):
        if place.get("description") and not is_substantive(place.get("description", "")):
            place["description"] = None
            place["descriptionSource"] = None
            cleared += 1

        desc: str | None = None
        source = ""

        website = place.get("website")
        if website and not is_bad_website(website):
            desc, source = fetch_from_website(website)
            time.sleep(0.35)

        if not desc:
            desc, source = fetch_wikipedia_summary(place["name"], place.get("type", "Center"))
            time.sleep(0.3)

        if desc and is_substantive(desc):
            place["description"] = desc
            place["descriptionSource"] = source
            flags = set(place.get("qualityFlags") or [])
            flags.add("unverified_description")
            flags.discard("missing_description")
            place["qualityFlags"] = list(flags)
            fetched += 1

        if idx % 10 == 0:
            save_places(payload, places)
            print(f"  {idx}/{len(targets)} — fetched {fetched}, cleared {cleared}", flush=True)

    save_places(payload, places)
    print(f"Done: fetched {fetched} substantive descriptions, cleared {cleared} junk entries")


if __name__ == "__main__":
    main()
