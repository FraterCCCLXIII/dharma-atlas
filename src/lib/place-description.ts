import type { Place } from "@/types/place";

/** Patterns that indicate catalog/directory boilerplate, not real place content. */
const JUNK_PATTERNS = [
  /\bsourced from\b/i,
  /\blisted under\b/i,
  /\bcan be found in\b/i,
  /\buse the map below\b/i,
  /\bplan your visit\b/i,
  /\bbuddhanet\b/i,
  /\bworld buddhist directory\b/i,
  /\bdirectory listing\b/i,
  /\bthis (?:center|temple|location|place|monastery|ashram)\b/i,
  /\bwelcome to (?:our|the) website\b/i,
  /\bclick here\b/i,
  /\bhome page\b/i,
  /\bgoogle maps\b/i,
  /^.{0,80} is a (?:center|temple|monastery|meditation center)/i,
  /\bearthquake\b/i,
  /\breceived many calls\b/i,
  /\bexpressing concern\b/i,
  /\bthis morning'?s\b/i,
  /\blatest news\b/i,
];

/** Hints that text describes practice, community, or activities. */
const PRACTICE_HINTS = [
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
];

export function isSubstantiveDescription(text: string | null | undefined): boolean {
  const trimmed = text?.trim();
  if (!trimmed || trimmed.length < 50) return false;

  for (const pattern of JUNK_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }

  const lower = trimmed.toLowerCase();
  const hintCount = PRACTICE_HINTS.filter((hint) => lower.includes(hint)).length;
  return hintCount >= 1;
}

export function placeDisplayDescription(place: Place): string | null {
  if (!isSubstantiveDescription(place.description)) return null;
  return place.description!.trim();
}

export function placeMetaDescription(place: Place): string {
  const display = placeDisplayDescription(place);
  if (display) return display.slice(0, 160);

  const address = place.address?.trim();
  if (address) {
    const tail = address.split(",").slice(-2).join(",").trim();
    if (tail) return `${place.name} — ${tail}`;
  }

  return place.name;
}
