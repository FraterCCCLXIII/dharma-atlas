import type { Faith, PlaceType } from "@/types/place";
import type { PilgrimageSite, PilgrimageTradition } from "@/data/pilgrimage";

const LANDSCAPE_RE =
  /\b(mount|mountain|lake|cave|caves|grotto|hill|peak|range|valley|river|parikrama|kora|forest|island|waterfall|pass)\b/i;
const HISTORIC_RE =
  /\b(ruin|ruins|stupa|pagoda|heritage|archaeolog|ancient city|rock.?cut|unesco)\b/i;
const MONASTERY_RE = /\b(monastery|gompa|vihara|abbey|cloister)\b/i;
const TEMPLE_RE =
  /\b(temple|mandir|ji\b|dera|wat\b|shrine|cathedral|church|masjid)\b/i;

/** Infer a PlaceType for a pilgrimage catalog site. */
export function inferPilgrimagePlaceType(site: PilgrimageSite): PlaceType {
  const haystack = `${site.name} ${site.summary} ${site.significance}`;
  if (LANDSCAPE_RE.test(haystack) && !TEMPLE_RE.test(site.name)) {
    return "Sacred Landscape";
  }
  if (HISTORIC_RE.test(haystack) && !TEMPLE_RE.test(site.name) && !MONASTERY_RE.test(haystack)) {
    return "Historic Site";
  }
  if (MONASTERY_RE.test(haystack)) return "Monastery";
  if (TEMPLE_RE.test(haystack) || site.templeNumber != null) return "Temple";
  // Named sacred cities / complexes without a building keyword.
  if (/\b(city|circuit|complex|zone)\b/i.test(haystack)) return "Historic Site";
  return "Temple";
}

export function pilgrimageFaith(tradition: PilgrimageTradition): Faith {
  return tradition === "Hindu" ? "Hindu" : "Buddhist";
}

/** Map catalog tradition tags onto place tradition filter values. */
export function pilgrimagePlaceTradition(tradition: PilgrimageTradition): string {
  if (tradition === "Interfaith") return "Buddhist";
  return tradition;
}

export function pilgrimagePlaceDescription(site: PilgrimageSite): string {
  const parts = [site.summary.trim(), site.significance.trim()].filter(Boolean);
  return parts.join("\n\n");
}

/** Public address line — place name + country (catalog has no street data). */
export function pilgrimagePlaceAddress(site: PilgrimageSite): string {
  const name = site.name.trim();
  const country = site.country.trim();
  if (!name) return country;
  if (!country) return name;
  if (name.toLowerCase() === country.toLowerCase()) return name;
  // Avoid "Lumbini, Lumbini" style duplication if name already ends with country.
  if (name.toLowerCase().endsWith(`, ${country.toLowerCase()}`)) return name;
  return `${name}, ${country}`;
}

/** True when the stored address is still the weak country-only seed form. */
export function isWeakPilgrimageAddress(
  address: string | null | undefined,
  site: PilgrimageSite,
): boolean {
  const value = (address ?? "").trim();
  if (!value) return true;
  const normalized = value.toLowerCase();
  const country = site.country.trim().toLowerCase();
  const name = site.name.trim().toLowerCase();
  return normalized === country || normalized === name;
}

/**
 * True when address is missing locality detail (country-only or "Name, Country").
 * Used to decide when reverse-geocode enrichment should rewrite the field.
 */
export function isThinPilgrimageAddress(
  address: string | null | undefined,
  site: PilgrimageSite,
): boolean {
  if (isWeakPilgrimageAddress(address, site)) return true;
  const value = (address ?? "").trim();
  if (value.toLowerCase() === pilgrimagePlaceAddress(site).toLowerCase()) {
    return true;
  }
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 2) {
    const last = parts[parts.length - 1]?.toLowerCase();
    if (last === site.country.trim().toLowerCase()) return true;
  }
  return false;
}
