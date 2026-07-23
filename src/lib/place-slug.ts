/** URL slug helpers for places (pretty paths; id remains the stable PK). */

const MAX_SLUG_LENGTH = 80;
const ONLY_STATE_ZIP_RE = /^(?:[A-Z]{2}|[A-Za-z]{3,})(?:\s+\d{5}(?:-\d{4})?)?$/i;

export function slugifyPlacePart(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-$/g, "");
}

export function normalizePlaceSlug(value: string): string {
  return slugifyPlacePart(value.trim());
}

export function isValidPlaceSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length >= 2 && value.length <= MAX_SLUG_LENGTH;
}

/**
 * Best-effort city token from a stored address line.
 * "2148 Addison St, Berkeley, CA 94704" → "berkeley"
 * "Berkeley, CA" → "berkeley"
 */
export function citySlugFromAddress(address: string | null | undefined): string | null {
  const parts = (address ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;

  if (parts.length >= 3) {
    const city = slugifyPlacePart(parts[parts.length - 2]!);
    return city || null;
  }

  if (parts.length === 2) {
    const [left, right] = parts;
    if (ONLY_STATE_ZIP_RE.test(right!) && !/\d{3,}/.test(left!)) {
      const city = slugifyPlacePart(left!);
      return city || null;
    }
    // "Street, City" — prefer the shorter trailing token when left looks like a street.
    if (/\d/.test(left!) || /street|st\.|ave|road|rd\.|blvd|drive|dr\.|way|lane|ln\./i.test(left!)) {
      const city = slugifyPlacePart(right!);
      return city || null;
    }
    const city = slugifyPlacePart(left!);
    return city || null;
  }

  // Single segment: only use if it doesn't look like a long street line.
  if (parts[0]!.length <= 40 && !/^\d+\s/.test(parts[0]!)) {
    const city = slugifyPlacePart(parts[0]!);
    return city || null;
  }
  return null;
}

export function buildPlaceSlugCandidates(input: {
  name: string;
  city?: string | null;
  address?: string | null;
  fallbackId?: string;
}): string[] {
  const base = slugifyPlacePart(input.name) || "place";
  const city =
    slugifyPlacePart(input.city ?? "") || citySlugFromAddress(input.address) || null;

  const candidates: string[] = [base];
  if (city && city !== base) {
    candidates.push(`${base}-${city}`.slice(0, MAX_SLUG_LENGTH).replace(/-$/g, ""));
  }

  // Numeric disambiguation on the best prefix (prefer name-city when present).
  const prefix = candidates[candidates.length - 1]!;
  for (let n = 2; n <= 30; n += 1) {
    candidates.push(`${prefix}-${n}`.slice(0, MAX_SLUG_LENGTH).replace(/-$/g, ""));
  }

  if (input.fallbackId) {
    const suffix = input.fallbackId.replace(/[^a-z0-9]/gi, "").slice(-4).toLowerCase();
    if (suffix) {
      candidates.push(`${base}-${suffix}`.slice(0, MAX_SLUG_LENGTH).replace(/-$/g, ""));
    }
  }

  return [...new Set(candidates.filter(Boolean))];
}
