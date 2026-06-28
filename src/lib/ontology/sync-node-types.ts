import { BUDDHIST_FILTER_ID } from "@/lib/ontology/defaults";
import type { OntologyNode, OntologyNodeType } from "@/types/ontology";

function nodeBySlug(nodes: OntologyNode[], slug: string) {
  return nodes.find((node) => node.slug === slug);
}

export function findBuddhismNode(nodes: OntologyNode[]): OntologyNode | undefined {
  return nodes.find((node) => node.filterId === BUDDHIST_FILTER_ID);
}

export function isRootNode(node: OntologyNode): boolean {
  return node.parentSlug === null;
}

export function isDirectChildOfRoot(node: OntologyNode, nodes: OntologyNode[]): boolean {
  if (!node.parentSlug) return false;
  const parent = nodeBySlug(nodes, node.parentSlug);
  return parent != null && isRootNode(parent);
}

/** Any node with a parent (nested at least one level). */
export function isNestedNode(node: OntologyNode): boolean {
  return node.parentSlug !== null;
}

/** Direct child of a branch root along this node's ancestor chain. */
export function findBranchHeadSlug(
  node: OntologyNode,
  nodes: OntologyNode[],
  branchRootSlug: string,
): string | null {
  let current: OntologyNode | undefined = node;
  while (current?.parentSlug) {
    if (current.parentSlug === branchRootSlug) return current.slug;
    current = nodeBySlug(nodes, current.parentSlug);
  }
  return null;
}

function inferNodeType(node: OntologyNode, nodes: OntologyNode[]): OntologyNodeType {
  if (isRootNode(node)) return "tradition";
  if (isDirectChildOfRoot(node, nodes)) return "lineage";
  return "subschool";
}

/** Keep internal node types aligned with tree position. */
export function syncOntologyNodeTypes(nodes: OntologyNode[]): OntologyNode[] {
  return nodes.map((node) => ({
    ...node,
    nodeType: inferNodeType(node, nodes),
  }));
}
