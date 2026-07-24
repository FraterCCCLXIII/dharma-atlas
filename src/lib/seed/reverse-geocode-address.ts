const NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse";
const USER_AGENT = "DharmaAtlas/1.0 (contact@dharmaatlas.com)";

export type ReverseAddressParts = {
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  village?: string;
  town?: string;
  city?: string;
  municipality?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

type NominatimReverse = {
  display_name?: string;
  address?: ReverseAddressParts;
};

let lastRequestAt = 0;

async function throttle() {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < 1100) {
    await new Promise((resolve) => setTimeout(resolve, 1100 - elapsed));
  }
  lastRequestAt = Date.now();
}

function sameLabel(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** True when label is just the place name with a suffix ("Lumbini Sanskritik"). */
function isPlacePrefixedLabel(placeName: string, label: string): boolean {
  const h = placeName.trim().toLowerCase();
  const n = label.trim().toLowerCase();
  return Boolean(h && n && (n.startsWith(`${h} `) || n.startsWith(`${h}-`)));
}

/**
 * Build a visitor-facing locality line from Nominatim parts.
 * Prefers: Place name, district/county, state/province, country.
 */
export function formatLocalityAddress(
  placeName: string,
  fallbackCountry: string,
  parts: ReverseAddressParts,
): string {
  const name = placeName.trim();
  // Prefer catalog country (e.g. "Tibet") over Nominatim's admin label.
  const country = (fallbackCountry.trim() || parts.country?.trim() || "").trim();
  const out: string[] = [];
  if (name) out.push(name);

  const county = parts.county?.trim() || parts.state_district?.trim() || "";
  const municipality = parts.municipality?.trim() || "";
  const state = parts.state?.trim() || "";

  if (county && !sameLabel(county, name) && !sameLabel(county, country)) {
    out.push(county);
  } else if (
    municipality &&
    !sameLabel(municipality, name) &&
    !sameLabel(municipality, country) &&
    !isPlacePrefixedLabel(name, municipality)
  ) {
    out.push(municipality);
  } else if (!county) {
    const locality = (
      parts.city ||
      parts.town ||
      parts.village ||
      parts.suburb ||
      ""
    ).trim();
    if (
      locality &&
      !sameLabel(locality, name) &&
      !sameLabel(locality, country) &&
      !isPlacePrefixedLabel(name, locality)
    ) {
      out.push(locality);
    }
  }

  // Keep province even when it shares the place name ("Lumbini Province").
  if (
    state &&
    !sameLabel(state, name) &&
    !sameLabel(state, country) &&
    !out.some((part) => sameLabel(part, state))
  ) {
    out.push(state);
  }

  if (country && !out.some((part) => sameLabel(part, country))) {
    out.push(country);
  }

  return out.join(", ");
}

export async function reverseGeocodeLocality(
  lat: number,
  lng: number,
  options?: { zoom?: number },
): Promise<ReverseAddressParts | null> {
  await throttle();
  const zoom = options?.zoom ?? 12;
  const url = new URL(NOMINATIM_REVERSE);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", String(zoom));
  url.searchParams.set("accept-language", "en");

  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as NominatimReverse;
  return data.address ?? null;
}
