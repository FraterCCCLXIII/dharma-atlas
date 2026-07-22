import { isPlaceInMapBounds, type MapBounds } from "@/lib/coords";

export type LocationFilterMatch = {
  label: string;
  lat: number;
  lng: number;
  bounds: MapBounds;
  /** Extra address tokens used when coords sit just outside the geocoder bbox. */
  matchTerms?: string[];
};

const US_STATE_ABBREV: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
};

export function locationPrimaryName(label: string): string {
  return label.split(",")[0]?.trim() ?? label.trim();
}

/** True when the typed query is clearly aiming at this geocoded locality. */
export function queryMatchesLocationLabel(query: string, label: string): boolean {
  const q = query.trim().toLowerCase();
  if (q.length < 3) return false;
  const primary = locationPrimaryName(label).toLowerCase();
  return primary === q || primary.startsWith(q) || q.startsWith(primary);
}

export function matchTermsForLocationLabel(label: string): string[] {
  const primary = locationPrimaryName(label);
  const terms = new Set<string>([primary]);
  const abbrev = US_STATE_ABBREV[primary.toLowerCase()];
  if (abbrev) terms.add(abbrev);
  return [...terms];
}

function addressMatchesTerm(address: string, term: string): boolean {
  const trimmed = term.trim();
  if (!trimmed || !address) return false;

  // Prefer postal-style state abbreviations: ", CA" / " CA 9" / " CA,".
  if (/^[A-Z]{2}$/.test(trimmed)) {
    const re = new RegExp(
      `(^|[\\s,])${trimmed}(?=[\\s,]|\\d|$)`,
      "i",
    );
    return re.test(address);
  }

  return address.toLowerCase().includes(trimmed.toLowerCase());
}

export function expandBounds(bounds: MapBounds, padRatio = 0.04): MapBounds {
  const latSpan = Math.max(0.01, bounds.north - bounds.south);
  const lngSpan = Math.max(0.01, bounds.east - bounds.west);
  const latPad = latSpan * padRatio;
  const lngPad = lngSpan * padRatio;
  return {
    north: Math.min(90, bounds.north + latPad),
    south: Math.max(-90, bounds.south - latPad),
    east: Math.min(180, bounds.east + lngPad),
    west: Math.max(-180, bounds.west - lngPad),
  };
}

export function placeMatchesLocationFilter(
  lat: unknown,
  lng: unknown,
  address: string | null | undefined,
  filter: LocationFilterMatch,
): boolean {
  if (isPlaceInMapBounds(lat, lng, filter.bounds)) return true;

  // Explicit empty matchTerms means bbox-only (e.g. Near you).
  const terms =
    filter.matchTerms != null
      ? filter.matchTerms
      : matchTermsForLocationLabel(filter.label);

  if (!address || terms.length === 0) return false;

  // Only use address fallback when the place is roughly near the region
  // (avoids "California Ave, Seattle" matching California).
  const loose = expandBounds(filter.bounds, 0.35);
  if (!isPlaceInMapBounds(lat, lng, loose)) return false;

  return terms.some((term) => addressMatchesTerm(address, term));
}
