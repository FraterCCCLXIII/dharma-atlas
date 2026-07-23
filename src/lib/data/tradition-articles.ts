import "server-only";

import { cache } from "react";
import {
  getTraditionArticle,
  type TraditionArticle,
} from "@/content/traditions";
import { getAllOntologyNodes, getOntologySnapshot } from "@/lib/data/ontology";
import { getCachedPlaceMarkers } from "@/lib/data/places";
import { getCachedExploreTeachers } from "@/lib/data/teachers";
import { buildDefaultOntologyNodes } from "@/lib/ontology/defaults";
import {
  findOntologyNode,
  getAncestorChain,
  getChildNodes,
  buildTraditionNavTree,
  type TraditionNavNode,
} from "@/lib/traditions/tree";
import {
  getSchools,
  inferTeacherSchools,
  placeMatchesTraditionFilter,
  setOntologySnapshot,
  teacherMatchesTradition,
} from "@/lib/schools";
import type { OntologyNode } from "@/types/ontology";
import type { PlaceMarker } from "@/types/place";
import type { Teacher } from "@/types/teacher";

const FEATURED_LIMIT = 8;

export type TraditionExploreFilters = {
  traditions: string[];
  schools: string[];
};

export type TraditionPageData = {
  node: OntologyNode;
  article: TraditionArticle;
  ancestors: OntologyNode[];
  children: OntologyNode[];
  places: PlaceMarker[];
  teachers: Teacher[];
  exploreFilters: TraditionExploreFilters;
  placeCount: number;
  teacherCount: number;
};

async function loadOntologyNodes(): Promise<OntologyNode[]> {
  try {
    const nodes = await getAllOntologyNodes();
    if (nodes.length > 0) return nodes;
  } catch {
    // Build / offline environments may lack a database.
  }
  return buildDefaultOntologyNodes();
}

export const getTraditionNavForest = cache(async (): Promise<TraditionNavNode[]> => {
  const nodes = await loadOntologyNodes();
  return buildTraditionNavTree(nodes);
});

export function exploreFiltersForNode(node: OntologyNode): TraditionExploreFilters {
  if (node.nodeType === "subschool") {
    return { traditions: [], schools: [node.slug] };
  }
  return { traditions: [node.filterId], schools: [] };
}

function placeMatchesNode(place: PlaceMarker, node: OntologyNode): boolean {
  if (node.nodeType === "subschool") {
    return getSchools(place).includes(node.slug);
  }
  return placeMatchesTraditionFilter(place, node.filterId);
}

function teacherMatchesNode(teacher: Teacher, node: OntologyNode): boolean {
  if (node.nodeType === "subschool") {
    return inferTeacherSchools(teacher).includes(node.slug);
  }
  return teacherMatchesTradition(teacher, node.filterId);
}

export const getTraditionPageData = cache(
  async (slug: string): Promise<TraditionPageData | null> => {
    const article = getTraditionArticle(slug);
    if (!article) return null;

    const [nodes, ontology] = await Promise.all([
      loadOntologyNodes(),
      getOntologySnapshot().catch(() => null),
    ]);

    if (ontology) setOntologySnapshot(ontology);

    const node = findOntologyNode(nodes, slug);
    if (!node) return null;

    let places: PlaceMarker[] = [];
    let teachers: Teacher[] = [];

    try {
      const [allPlaces, allTeachers] = await Promise.all([
        getCachedPlaceMarkers(),
        getCachedExploreTeachers(),
      ]);
      places = allPlaces.filter((place) => placeMatchesNode(place, node));
      teachers = allTeachers.filter((teacher) => teacherMatchesNode(teacher, node));
    } catch {
      // Directory sections stay empty when DB is unavailable.
    }

    const children = getChildNodes(nodes, slug).filter((child) =>
      Boolean(getTraditionArticle(child.slug)),
    );

    return {
      node,
      article,
      ancestors: getAncestorChain(nodes, slug),
      children,
      places: places.slice(0, FEATURED_LIMIT),
      teachers: teachers.slice(0, FEATURED_LIMIT),
      exploreFilters: exploreFiltersForNode(node),
      placeCount: places.length,
      teacherCount: teachers.length,
    };
  },
);

export type TraditionHubCard = {
  slug: string;
  label: string;
  summary: string;
  heroImage: string;
  nodeType: OntologyNode["nodeType"];
};

export const getTraditionHubCards = cache(async (): Promise<{
  buddhistLineages: TraditionHubCard[];
  otherTraditions: TraditionHubCard[];
}> => {
  const nodes = await loadOntologyNodes();
  const buddhistRoot = nodes.find(
    (node) => node.parentSlug === null && node.filterId === "Buddhist",
  );

  const toCard = (node: OntologyNode): TraditionHubCard | null => {
    const article = getTraditionArticle(node.slug);
    if (!article) return null;
    return {
      slug: node.slug,
      label: node.label,
      summary: article.summary,
      heroImage: article.heroImage,
      nodeType: node.nodeType,
    };
  };

  const buddhistLineages = buddhistRoot
    ? getChildNodes(nodes, buddhistRoot.slug)
        .map(toCard)
        .filter((card): card is TraditionHubCard => card != null)
    : [];

  const otherTraditions = nodes
    .filter(
      (node) =>
        node.parentSlug === null &&
        node.filterId !== "Buddhist" &&
        node.slug !== buddhistRoot?.slug,
    )
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
    .map(toCard)
    .filter((card): card is TraditionHubCard => card != null);

  return { buddhistLineages, otherTraditions };
});
