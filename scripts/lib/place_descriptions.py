"""Validate substantive place descriptions (not catalog boilerplate)."""

from __future__ import annotations

import re

JUNK_PATTERNS = [
    r"sourced from",
    r"listed under",
    r"can be found in",
    r"use the map below",
    r"plan your visit",
    r"buddhanet",
    r"world buddhist directory",
    r"directory listing",
    r"this (?:center|temple|location|place|monastery|ashram)",
    r"welcome to (?:our|the) website",
    r"click here",
    r"google maps",
    r"^.{0,80} is a (?:center|temple|monastery|meditation center)",
    r"earthquake",
    r"received many calls",
    r"expressing concern",
    r"this morning'?s",
    r"latest news",
    r"read more about",
]

PRACTICE_HINTS = [
    "meditation",
    "mindfulness",
    "practice",
    "teaching",
    "teachings",
    "sangha",
    "retreat",
    "dharma",
    "dharm",
    "monastic",
    "ordain",
    "chant",
    "puja",
    "zendo",
    "vipassana",
    "zen",
    "theravada",
    "tibetan",
    "mahayana",
    "lineage",
    "community",
    "worship",
    "study",
    "contemplative",
    "spiritual",
    "monastery",
    "temple",
    "shrine",
    "offers",
    "welcome",
    "gather",
    "session",
    "course",
    "program",
]


def is_substantive(text: str | None) -> bool:
    if not text:
        return False
    text = text.strip()
    if len(text) < 50:
        return False
    lower = text.lower()
    for pattern in JUNK_PATTERNS:
        if re.search(pattern, lower):
            return False
    return any(hint in lower for hint in PRACTICE_HINTS)
