import {
  PILGRIMAGE_ROUTES,
  PILGRIMAGE_SITES,
  type PilgrimageKind,
} from "@/data/pilgrimage";

export type PilgrimageSearchHit = {
  kind: PilgrimageKind;
  slug: string;
  name: string;
  region: string;
  tradition: string;
  summary: string;
};

function scoreHit(query: string, hit: PilgrimageSearchHit): number {
  const q = query.toLowerCase();
  const name = hit.name.toLowerCase();
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  if (hit.region.toLowerCase().includes(q)) return 40;
  if (hit.tradition.toLowerCase().includes(q)) return 35;
  if (hit.summary.toLowerCase().includes(q)) return 20;
  return 0;
}

/** Client-side typeahead over the static pilgrimage catalog. */
export function searchPilgrimageCatalog(
  query: string,
  limit = 8,
): PilgrimageSearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const hits: PilgrimageSearchHit[] = [
    ...PILGRIMAGE_SITES.map((site) => ({
      kind: "site" as const,
      slug: site.slug,
      name: site.name,
      region: site.region,
      tradition: site.tradition,
      summary: site.summary,
    })),
    ...PILGRIMAGE_ROUTES.map((route) => ({
      kind: "route" as const,
      slug: route.slug,
      name: route.name,
      region: route.region,
      tradition: route.tradition,
      summary: route.summary,
    })),
  ];

  return hits
    .map((hit) => ({ hit, score: scoreHit(q, hit) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.hit.name.localeCompare(b.hit.name))
    .slice(0, limit)
    .map((entry) => entry.hit);
}
