import type { OntologyNode } from "@/types/ontology";

export type TraditionNavNode = {
  slug: string;
  label: string;
  nodeType: OntologyNode["nodeType"];
  children: TraditionNavNode[];
};

/** Build a forest of root → lineage → subschool for the traditions left nav. */
export function buildTraditionNavTree(nodes: OntologyNode[]): TraditionNavNode[] {
  const byParent = new Map<string | null, OntologyNode[]>();

  for (const node of nodes) {
    const key = node.parentSlug;
    const list = byParent.get(key) ?? [];
    list.push(node);
    byParent.set(key, list);
  }

  for (const list of byParent.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
  }

  function toNav(node: OntologyNode): TraditionNavNode {
    const children = (byParent.get(node.slug) ?? []).map(toNav);
    return {
      slug: node.slug,
      label: node.label,
      nodeType: node.nodeType,
      children,
    };
  }

  return (byParent.get(null) ?? []).map(toNav);
}

export function findOntologyNode(
  nodes: OntologyNode[],
  slug: string,
): OntologyNode | undefined {
  return nodes.find((node) => node.slug === slug);
}

export function getChildNodes(
  nodes: OntologyNode[],
  parentSlug: string,
): OntologyNode[] {
  return nodes
    .filter((node) => node.parentSlug === parentSlug)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

export function getAncestorChain(
  nodes: OntologyNode[],
  slug: string,
): OntologyNode[] {
  const bySlug = new Map(nodes.map((node) => [node.slug, node]));
  const chain: OntologyNode[] = [];
  let current = bySlug.get(slug);

  while (current) {
    chain.unshift(current);
    current = current.parentSlug ? bySlug.get(current.parentSlug) : undefined;
  }

  return chain;
}
