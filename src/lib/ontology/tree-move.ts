import { syncOntologyNodeTypes } from "@/lib/ontology/sync-node-types";
import type { OntologyNode } from "@/types/ontology";

export type DropMode = "before" | "after" | "inside";

export type MoveResult =
  | { ok: true; nodes: OntologyNode[] }
  | { ok: false; nodes: OntologyNode[]; message: string };

function nodeBySlug(nodes: OntologyNode[], slug: string) {
  return nodes.find((node) => node.slug === slug);
}

function siblingsOf(nodes: OntologyNode[], parentSlug: string | null) {
  return nodes
    .filter((node) => node.parentSlug === parentSlug)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

function isDescendant(nodes: OntologyNode[], ancestorSlug: string, slug: string): boolean {
  let current = nodeBySlug(nodes, slug);
  while (current?.parentSlug) {
    if (current.parentSlug === ancestorSlug) return true;
    current = nodeBySlug(nodes, current.parentSlug);
  }
  return false;
}

function applySortOrders(nodes: OntologyNode[], parentSlug: string | null) {
  const order = siblingsOf(nodes, parentSlug).map((node) => node.slug);
  const sortOrderBySlug = new Map(order.map((slug, index) => [slug, index]));
  return nodes.map((node) =>
    sortOrderBySlug.has(node.slug) ? { ...node, sortOrder: sortOrderBySlug.get(node.slug)! } : node,
  );
}

export function canDropOntologyNode(
  nodes: OntologyNode[],
  draggedSlug: string,
  targetSlug: string,
  mode: DropMode,
): boolean {
  const result = moveOntologyNode(nodes, draggedSlug, targetSlug, mode);
  return result.ok;
}

export function moveOntologyNode(
  nodes: OntologyNode[],
  draggedSlug: string,
  targetSlug: string,
  mode: DropMode,
): MoveResult {
  const dragged = nodeBySlug(nodes, draggedSlug);
  const target = nodeBySlug(nodes, targetSlug);

  if (!dragged || !target || dragged.slug === target.slug) {
    return { ok: false, nodes, message: "Invalid drop target." };
  }

  if (isDescendant(nodes, dragged.slug, target.slug)) {
    return { ok: false, nodes, message: "Cannot move a node into its own descendants." };
  }

  let newParentSlug: string | null;
  let insertBeforeSlug: string | null = null;
  let insertAfterSlug: string | null = null;

  if (mode === "inside") {
    newParentSlug = target.slug;
  } else {
    newParentSlug = target.parentSlug;
    if (mode === "before") insertBeforeSlug = target.slug;
    else insertAfterSlug = target.slug;
  }

  let next = nodes.map((node) =>
    node.slug === dragged.slug ? { ...node, parentSlug: newParentSlug } : node,
  );

  const newSiblings = siblingsOf(next, newParentSlug).filter((node) => node.slug !== dragged.slug);
  let insertIndex = newSiblings.length;

  if (insertBeforeSlug) {
    const index = newSiblings.findIndex((node) => node.slug === insertBeforeSlug);
    insertIndex = index === -1 ? newSiblings.length : index;
  } else if (insertAfterSlug) {
    const index = newSiblings.findIndex((node) => node.slug === insertAfterSlug);
    insertIndex = index === -1 ? newSiblings.length : index + 1;
  }

  newSiblings.splice(insertIndex, 0, { ...dragged, parentSlug: newParentSlug });
  const sortOrderBySlug = new Map(newSiblings.map((node, index) => [node.slug, index]));

  next = next.map((node) =>
    sortOrderBySlug.has(node.slug) ? { ...node, sortOrder: sortOrderBySlug.get(node.slug)! } : node,
  );

  const oldParent = dragged.parentSlug;
  if (oldParent !== newParentSlug) {
    next = applySortOrders(next, oldParent);
  }

  return { ok: true, nodes: syncOntologyNodeTypes(next) };
}

export function getDropMode(
  event: { clientY: number; currentTarget: EventTarget & HTMLElement },
): DropMode {
  const rect = event.currentTarget.getBoundingClientRect();
  const offset = event.clientY - rect.top;
  const ratio = offset / rect.height;

  if (ratio > 0.28 && ratio < 0.72) {
    return "inside";
  }

  return ratio < 0.5 ? "before" : "after";
}

export function dropModeLabel(mode: DropMode): string {
  switch (mode) {
    case "before":
      return "Insert before";
    case "after":
      return "Insert after";
    case "inside":
      return "Nest inside";
  }
}
