/**
 * Find a working portrait URL for a person via free web/media APIs.
 */

import { fetchJson, USER_AGENT } from "./http";
import { qidFromTitle } from "./wikidata";

const WP_API = "https://en.wikipedia.org/w/api.php";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const VALID_THUMB_WIDTHS = [330, 500, 960];

interface ImageCandidate {
  url: string;
  source: string;
}

export function normalizeWikimediaThumb(url: string, targetWidth = 330): string {
  const width = VALID_THUMB_WIDTHS.reduce((best, w) =>
    Math.abs(w - targetWidth) < Math.abs(best - targetWidth) ? w : best,
  );
  return url.replace(/\/(\d+)px-/, `/${width}px-`);
}

function nameTokens(name: string): string[] {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
}

const STOP_TOKENS = new Set([
  "de", "da", "di", "du", "van", "von", "ibn", "the", "of", "saint", "st", "brother", "swami", "sri",
]);

function significantTokens(name: string): string[] {
  return nameTokens(name).filter((t) => !STOP_TOKENS.has(t));
}

function matchesName(text: string, name: string): boolean {
  const tokens = significantTokens(name);
  if (tokens.length === 0) return false;
  const hay = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return tokens.every((t) => hay.includes(t));
}

function scoreImageUrl(url: string, name: string): number {
  const lower = url.toLowerCase();
  let score = 0;
  if (lower.includes("wikimedia.org") || lower.includes("wikipedia.org")) score += 100;
  else if (/tricycle\.org|thework\.com|dharma\.org|spiritrock\.org|dharmaseed\.org/.test(lower))
    score += 80;
  else if (lower.includes("amazon.com") || lower.includes("bookshop.org")) score += 20;
  if (matchesName(url, name)) score += 40;
  return score;
}

function isLikelyPortraitUrl(url: string): boolean {
  const lower = url.toLowerCase();
  if (lower.endsWith(".svg") || lower.includes(".svg/")) return false;
  if (lower.includes(".pdf") || lower.includes(".gif")) return false;
  if (lower.includes("tibetian_wheel") || lower.includes("tibetan_wheel")) return false;
  return true;
}

export async function verifyImageUrl(url: string): Promise<boolean> {
  if (!url || !isLikelyPortraitUrl(url)) return false;
  try {
    await new Promise((r) => setTimeout(r, 350));
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      redirect: "follow",
    });
    if (res.status === 429 && url.includes("wikimedia.org")) return true;
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/")) return false;
    if (ct.includes("svg")) return false;
    const len = Number(res.headers.get("content-length") ?? 0);
    if (len > 0 && len < 800) return false;
    return true;
  } catch {
    return false;
  }
}

async function acceptCandidate(
  candidate: ImageCandidate | null,
  name?: string,
  trustWikimedia = false,
): Promise<string | null> {
  if (!candidate || !isLikelyPortraitUrl(candidate.url)) return null;
  if (candidate.url.includes("gettyimages.com")) return null;
  if (name && candidate.source === "wikidata-p18") {
    if (!matchesName(candidate.url, name)) return null;
  }
  if (trustWikimedia && candidate.url.includes("wikimedia.org")) return candidate.url;
  const ok = await verifyImageUrl(candidate.url);
  return ok ? candidate.url : null;
}

async function resolveBestWikipediaTitle(name: string, hint?: string | null): Promise<string> {
  if (hint) {
    const summary = await fromWikipediaSummary(hint);
    if (summary) return hint;
  }
  const searchUrl = `${WP_API}?action=opensearch&search=${encodeURIComponent(`${name} spiritual teacher`)}&limit=5&namespace=0&format=json`;
  const data = await fetchJson<[string, string[]]>(searchUrl);
  const titles = data?.[1] ?? [];
  for (const title of titles) {
    if (matchesName(title, name)) return title;
  }
  return hint ?? name;
}

async function fromWikipediaSummary(title: string): Promise<ImageCandidate | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const data = await fetchJson<{ thumbnail?: { source?: string } }>(url);
  const thumb = data?.thumbnail?.source;
  if (!thumb) return null;
  return { url: normalizeWikimediaThumb(thumb), source: "wikipedia-summary" };
}

interface CommonsImageInfoResponse {
  query?: {
    pages?: Record<
      string,
      { title?: string; imageinfo?: { thumburl?: string; url?: string; mime?: string }[] }
    >;
  };
}

async function commonsThumbFromFilename(filename: string): Promise<string | null> {
  const title = filename.startsWith("File:") ? filename : `File:${filename}`;
  const apiUrl = `${COMMONS_API}?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|mime&iiurlwidth=330&format=json`;
  const data = await fetchJson<CommonsImageInfoResponse>(apiUrl);
  const pages = data?.query?.pages;
  if (!pages) return null;
  for (const page of Object.values(pages)) {
    const info = page.imageinfo?.[0];
    if (!info?.mime?.startsWith("image/") || info.mime.includes("svg")) continue;
    return info.thumburl ?? info.url ?? null;
  }
  return null;
}

async function fromWikidataImage(wikidataId: string): Promise<ImageCandidate | null> {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&props=claims&format=json`;
  const data = await fetchJson<{
    entities?: Record<string, { claims?: { P18?: { mainsnak?: { datavalue?: { value?: string } } }[] } }>;
  }>(url);
  const filename = data?.entities?.[wikidataId]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  if (!filename) return null;
  const thumb = await commonsThumbFromFilename(filename);
  return thumb ? { url: thumb, source: "wikidata-p18" } : null;
}

async function fromWikipediaPageImage(title: string): Promise<ImageCandidate | null> {
  const apiUrl = `${WP_API}?action=query&titles=${encodeURIComponent(title)}&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=330&format=json`;
  const data = await fetchJson<{
    query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
  }>(apiUrl);
  const pages = data?.query?.pages;
  if (!pages) return null;
  for (const page of Object.values(pages)) {
    const thumb = page.thumbnail?.source;
    if (thumb) return { url: normalizeWikimediaThumb(thumb), source: "wikipedia-pageimage" };
  }
  return null;
}

async function fromCommonsSearch(name: string): Promise<ImageCandidate | null> {
  for (const query of [`"${name}"`, `${name} portrait`]) {
    const apiUrl = `${COMMONS_API}?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime&iiurlwidth=330&format=json`;
    const data = await fetchJson<CommonsImageInfoResponse>(apiUrl);
    const pages = data?.query?.pages;
    if (!pages) continue;
    const ranked: ImageCandidate[] = [];
    for (const page of Object.values(pages)) {
      const info = page.imageinfo?.[0];
      const fileTitle = page.title ?? "";
      if (!info?.mime?.startsWith("image/") || info.mime.includes("svg")) continue;
      const thumb = info.thumburl ?? info.url;
      if (!thumb || !isLikelyPortraitUrl(thumb)) continue;
      if (!matchesName(`${fileTitle} ${thumb}`, name)) continue;
      ranked.push({ url: thumb, source: "commons-search" });
    }
    ranked.sort((a, b) => scoreImageUrl(b.url, name) - scoreImageUrl(a.url, name));
    if (ranked[0]) return ranked[0];
  }
  return null;
}

async function fromDuckDuckGo(name: string): Promise<ImageCandidate | null> {
  const queries = [
    `${name} spiritual teacher portrait`,
    `${name} author photo`,
    `${name} portrait`,
  ];

  for (const query of queries) {
    try {
      await new Promise((r) => setTimeout(r, 400));
      const searchPage = await fetch(
        `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
        { headers: { "User-Agent": USER_AGENT, Accept: "text/html" } },
      );
      if (!searchPage.ok) continue;
      const html = await searchPage.text();
      const vqdMatch = html.match(/vqd=["']([^"']+)["']/);
      if (!vqdMatch) continue;

      await new Promise((r) => setTimeout(r, 400));
      const imgRes = await fetch(
        `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${encodeURIComponent(vqdMatch[1])}&p=1`,
        { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } },
      );
      if (!imgRes.ok) continue;
      const data = (await imgRes.json()) as {
        results?: { image?: string; title?: string; url?: string }[];
      };

      const ranked = (data.results ?? [])
        .filter(
          (r) =>
            r.image &&
            isLikelyPortraitUrl(r.image) &&
            matchesName(`${r.title ?? ""} ${r.url ?? ""} ${r.image}`, name),
        )
        .map((r) => ({
          url: r.image!,
          source: "duckduckgo",
          score: scoreImageUrl(r.image!, name) + (matchesName(r.title ?? "", name) ? 30 : 0),
        }))
        .sort((a, b) => b.score - a.score);

      if (ranked[0]) return { url: ranked[0].url, source: "duckduckgo" };
    } catch {
      /* try next query */
    }
  }
  return null;
}

export interface ImageSearchInput {
  name: string;
  wikipediaTitle?: string | null;
  wikidataId?: string | null;
}

export async function findPortraitUrl(input: ImageSearchInput): Promise<{
  url: string;
  source: string;
} | null> {
  const title = await resolveBestWikipediaTitle(input.name, input.wikipediaTitle ?? input.name);
  const qid = input.wikidataId ?? (await qidFromTitle(title));

  const trySource = async (
    getCandidate: () => Promise<ImageCandidate | null>,
    trustWikimedia = false,
  ) => {
    const candidate = await getCandidate();
    const url = await acceptCandidate(candidate, input.name, trustWikimedia);
    return url ? { url, source: candidate!.source } : null;
  };

  for (const [fn, trust] of [
    [() => fromWikipediaSummary(title), true],
    [() => (qid ? fromWikidataImage(qid) : Promise.resolve(null)), true],
    [() => fromWikipediaPageImage(title), true],
    [() => fromDuckDuckGo(input.name), false],
    [() => fromCommonsSearch(input.name), true],
  ] as const) {
    const result = await trySource(fn, trust);
    if (result) return result;
  }

  return null;
}

export function needsReplacement(photo: string): boolean {
  if (!photo) return true;
  if (photo.startsWith("/people/") || photo.startsWith("/teachers/")) return false;
  if (!isLikelyPortraitUrl(photo)) return true;
  if (photo.includes("Special:FilePath") || photo.includes("/wiki/")) return true;
  if (photo.includes("gettyimages.com")) return true;
  return false;
}
