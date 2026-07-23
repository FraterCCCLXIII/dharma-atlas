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
