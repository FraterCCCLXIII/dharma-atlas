/** Default placeholder images for ontology nodes (Pexels, stored in /public/traditions). */
export const ONTOLOGY_NODE_DEFAULT_IMAGES: Record<string, string> = {
  buddhist: "/traditions/buddhist.jpg",
  zen: "/traditions/zen.jpg",
  tibetan: "/traditions/tibetan.jpg",
  theravada: "/traditions/theravada.jpg",
  "southeast-asian": "/traditions/southeast-asian.jpg",
  "pure-land": "/traditions/pure-land.jpg",
  won: "/traditions/won-buddhism.jpg",
  mahayana: "/traditions/mahayana.jpg",
  hindu: "/traditions/hindu.jpg",
};

/** Place tradition strings that need their own image beyond lineage node mapping. */
export const PLACE_TRADITION_IMAGE_OVERRIDES: Record<string, string> = {
  Chinese: "/traditions/chinese.jpg",
  Vietnamese: "/traditions/vietnamese.jpg",
  Buddhist: "/traditions/buddhist.jpg",
  "Won Buddhism": "/traditions/won-buddhism.jpg",
};

export function defaultImagePathForNodeSlug(slug: string): string | null {
  return ONTOLOGY_NODE_DEFAULT_IMAGES[slug] ?? null;
}

function nodeDepth(slug: string, nodesBySlug: Map<string, { parentSlug: string | null }>): number {
  let depth = 0;
  let current = nodesBySlug.get(slug);
  while (current?.parentSlug) {
    depth += 1;
    current = nodesBySlug.get(current.parentSlug);
  }
  return depth;
}

export function lookupTraditionDefaultImage(
  tradition: string,
  map: Record<string, string>,
): string | null {
  return map[tradition] ?? null;
}

/** Map place.tradition values to a default hero image path from ontology nodes. */
export function buildTraditionDefaultImages(
  nodes: Array<{
    slug: string;
    parentSlug: string | null;
    filterId: string;
    placeTraditions: string[];
    defaultImagePath: string | null;
    appliesToLocations: boolean;
  }>,
): Record<string, string> {
  const nodesBySlug = new Map(nodes.map((node) => [node.slug, node]));
  const sorted = [...nodes].sort(
    (a, b) => nodeDepth(a.slug, nodesBySlug) - nodeDepth(b.slug, nodesBySlug),
  );

  const map: Record<string, string> = {};

  for (const node of sorted) {
    const path = node.defaultImagePath?.trim();
    if (!path || !node.appliesToLocations) continue;

    map[node.filterId] = path;
    for (const tradition of node.placeTraditions) {
      const trimmed = tradition.trim();
      if (trimmed) map[trimmed] = path;
    }
  }

  for (const [tradition, path] of Object.entries(PLACE_TRADITION_IMAGE_OVERRIDES)) {
    map[tradition] = path;
  }

  return map;
}
