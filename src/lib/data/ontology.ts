import "server-only";

import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { ontologyNodes, type OntologyNodeRow } from "@/db/schema";
import { buildDefaultOntologySnapshot, buildDefaultOntologyNodes } from "@/lib/ontology/defaults";
import { buildOntologySnapshot } from "@/lib/ontology/build-snapshot";
import type { OntologyNode, OntologySnapshot } from "@/types/ontology";

function rowToNode(row: OntologyNodeRow): OntologyNode {
  return {
    slug: row.slug,
    label: row.label,
    parentSlug: row.parentSlug,
    sortOrder: row.sortOrder,
    nodeType: row.nodeType as OntologyNode["nodeType"],
    filterId: row.filterId,
    placeTraditions: row.placeTraditions,
    inferPattern: row.inferPattern,
    appliesToLocations: row.appliesToLocations,
    appliesToPeople: row.appliesToPeople,
  };
}

function nodeToRow(node: OntologyNode) {
  return {
    slug: node.slug,
    label: node.label,
    parentSlug: node.parentSlug,
    sortOrder: node.sortOrder,
    nodeType: node.nodeType,
    filterId: node.filterId,
    placeTraditions: node.placeTraditions,
    inferPattern: node.inferPattern,
    appliesToLocations: node.appliesToLocations,
    appliesToPeople: node.appliesToPeople,
  };
}

let cachedSnapshot: OntologySnapshot | null = null;

export function invalidateOntologyCache() {
  cachedSnapshot = null;
}

export async function getAllOntologyNodes(): Promise<OntologyNode[]> {
  const rows = await db
    .select()
    .from(ontologyNodes)
    .orderBy(asc(ontologyNodes.sortOrder), asc(ontologyNodes.label));
  return rows.map(rowToNode);
}

export async function getOntologySnapshot(): Promise<OntologySnapshot> {
  if (cachedSnapshot) return cachedSnapshot;

  const nodes = await getAllOntologyNodes();
  if (nodes.length === 0) {
    cachedSnapshot = buildDefaultOntologySnapshot();
    return cachedSnapshot;
  }

  cachedSnapshot = buildOntologySnapshot(nodes);
  return cachedSnapshot;
}

export async function replaceOntologyNodes(nodes: OntologyNode[]) {
  buildOntologySnapshot(nodes);

  await db.transaction(async (tx) => {
    await tx.delete(ontologyNodes);
    if (nodes.length) {
      await tx.insert(ontologyNodes).values(nodes.map(nodeToRow));
    }
  });

  invalidateOntologyCache();
}

export async function seedOntologyIfEmpty() {
  const nodes = await getAllOntologyNodes();
  if (nodes.length > 0) return 0;

  const defaults = buildDefaultOntologyNodes();
  await replaceOntologyNodes(defaults);
  return defaults.length;
}

export { rowToNode, nodeToRow };
