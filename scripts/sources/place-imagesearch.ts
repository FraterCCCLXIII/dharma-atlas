/**
 * Find venue images via website og:image, Wikipedia, and Commons.
 */

import { fetchJson, USER_AGENT } from "./http";
import { normalizeWikimediaThumb, verifyImageUrl } from "./imagesearch";

const WP_API = "https://en.wikipedia.org/w/api.php";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

function nameTokens(name: string): string[] {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
}

function matchesName(text: string, name: string): boolean {
  const tokens = nameTokens(name);
  if (tokens.length === 0) return false;
  const hay = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return tokens.filter((t) => t.length > 3).some((t) => hay.includes(t));
}

function isLikelyVenueUrl(url: string): boolean {
  const lower = url.toLowerCase();
  if (lower.endsWith(".svg") || lower.includes(".svg/")) return false;
  if (lower.includes(".pdf") || lower.includes(".gif")) return false;
  if (lower.includes("icon") || lower.includes("logo") && lower.includes("favicon")) return false;
  return true;
}

async function fromOgImage(website: string): Promise<{ url: string; source: string } | null> {
  try {
    await new Promise((r) => setTimeout(r, 300));
    const res = await fetch(website, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = await res.text();
    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1] && isLikelyVenueUrl(match[1])) {
        const url = match[1];
        const ok = await verifyImageUrl(url);
        if (ok) return { url, source: "website-og" };
      }
    }
  } catch {
    return null;
  }
  return null;
}

async function fromWikipediaPageImage(name: string, type: string): Promise<{ url: string; source: string } | null> {
  for (const title of [`${name} ${type}`, `${name} Buddhist temple`, name]) {
    const apiUrl = `${WP_API}?action=query&titles=${encodeURIComponent(title)}&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=640&format=json`;
    const data = await fetchJson<{
      query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
    }>(apiUrl);
    const pages = data?.query?.pages;
    if (!pages) continue;
    for (const page of Object.values(pages)) {
      const thumb = page.thumbnail?.source;
      if (thumb && isLikelyVenueUrl(thumb)) {
        const url = normalizeWikimediaThumb(thumb, 640);
        const ok = await verifyImageUrl(url);
        if (ok) return { url, source: "wikipedia" };
      }
    }
  }
  return null;
}

async function fromCommonsSearch(name: string, type: string): Promise<{ url: string; source: string } | null> {
  for (const query of [`${name} ${type}`, `${name} temple`, `${name} monastery`]) {
    const apiUrl = `${COMMONS_API}?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|mime&iiurlwidth=640&format=json`;
    const data = await fetchJson<{
      query?: {
        pages?: Record<
          string,
          { title?: string; imageinfo?: { thumburl?: string; url?: string; mime?: string }[] }
        >;
      };
    }>(apiUrl);
    const pages = data?.query?.pages;
    if (!pages) continue;
    for (const page of Object.values(pages)) {
      const info = page.imageinfo?.[0];
      const fileTitle = page.title ?? "";
      if (!info?.mime?.startsWith("image/") || info.mime.includes("svg")) continue;
      const thumb = info.thumburl ?? info.url;
      if (!thumb || !isLikelyVenueUrl(thumb)) continue;
      if (!matchesName(`${fileTitle} ${thumb}`, name)) continue;
      const ok = await verifyImageUrl(thumb);
      if (ok) return { url: thumb, source: "wikimedia" };
    }
  }
  return null;
}

export interface VenueImageInput {
  name: string;
  type: string;
  website?: string | null;
}

export async function findVenueImage(input: VenueImageInput): Promise<{
  url: string;
  source: string;
} | null> {
  if (input.website) {
    const og = await fromOgImage(input.website);
    if (og) return og;
  }

  const wiki = await fromWikipediaPageImage(input.name, input.type);
  if (wiki) return wiki;

  const commons = await fromCommonsSearch(input.name, input.type);
  if (commons) return commons;

  return null;
}

export function needsPlacePhotoReplacement(photo: string | undefined | null): boolean {
  if (!photo) return true;
  if (photo.includes("/places/generated/")) return true;
  if (photo.startsWith("/places/")) return false;
  return true;
}
