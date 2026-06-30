import { findBranchHeadSlug, findBuddhismNode, isRootNode } from "@/lib/ontology/sync-node-types";
import { BUDDHIST_FILTER_ID } from "@/lib/ontology/defaults";
import { buildTraditionDefaultImages } from "@/lib/ontology/tradition-default-images";
import type { OntologyNode, OntologySnapshot, PlaceTraditionPickerOption } from "@/types/ontology";

function buildPlaceTraditionPickerOptions(
  nodes: OntologyNode[],
  buddhismNode: OntologyNode | undefined,
): PlaceTraditionPickerOption[] {
  const seen = new Set<string>();
  const options: PlaceTraditionPickerOption[] = [];

  const add = (value: string, label: string, group: PlaceTraditionPickerOption["group"]) => {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    options.push({ value: trimmed, label: label.trim() || trimmed, group });
  };

  for (const node of nodes) {
    if (!node.appliesToLocations) continue;

    const isOtherRoot = isRootNode(node) && node.slug !== buddhismNode?.slug;
    const group: PlaceTraditionPickerOption["group"] = isOtherRoot ? "Other" : "Buddhist";

    if (node.nodeType === "lineage" || node.nodeType === "tradition") {
      add(node.filterId, node.label, group);
    } else if (node.nodeType === "subschool") {
      add(node.label, node.label, "Buddhist");
    }

    for (const placeTradition of node.placeTraditions) {
      add(placeTradition, placeTradition, group);
    }
  }

  return options.sort((a, b) => {
    if (a.group !== b.group) return a.group === "Buddhist" ? -1 : 1;
    return a.label.localeCompare(b.label);
  });
}

export function buildOntologySnapshot(nodes: OntologyNode[]): OntologySnapshot {
  const buddhismNode = findBuddhismNode(nodes);

  const lineageSchools = buddhismNode
    ? nodes
        .filter((node) => node.parentSlug === buddhismNode.slug)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
        .map((node) => ({
          slug: node.slug,
          id: node.filterId,
          label: node.label,
          placeTraditions: node.placeTraditions,
        }))
    : [];

  const subschoolLabels: Record<string, string> = {};
  const subschoolRules: OntologySnapshot["subschoolRules"] = [];

  if (buddhismNode) {
    for (const node of nodes.filter((entry) => entry.parentSlug !== null)) {
      const branchSlug = findBranchHeadSlug(node, nodes, buddhismNode.slug);
      if (!branchSlug || branchSlug === node.slug) continue;

      subschoolLabels[node.slug] = node.label;
      subschoolRules.push({
        slug: node.slug,
        label: node.label,
        lineageSchool: branchSlug,
        placeTraditions: node.placeTraditions,
        pattern: node.inferPattern ? new RegExp(node.inferPattern, "i") : /^$/i,
      });
    }
  }

  const otherTraditions = nodes
    .filter((node) => isRootNode(node) && node.slug !== buddhismNode?.slug)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
    .map((node) => ({
      filterId: node.filterId,
      label: node.label,
    }));

  const buddhistPlaceTraditions = [
    ...new Set([
      buddhismNode?.filterId ?? BUDDHIST_FILTER_ID,
      ...lineageSchools.flatMap((school) => school.placeTraditions),
    ]),
  ];

  const placeTraditionPickerOptions = buildPlaceTraditionPickerOptions(nodes, buddhismNode);
  const traditionDefaultImages = buildTraditionDefaultImages(nodes);

  return {
    buddhistRoot: {
      slug: buddhismNode?.slug ?? "",
      filterId: buddhismNode?.filterId ?? BUDDHIST_FILTER_ID,
      label: buddhismNode?.label ?? "Buddhism",
    },
    lineageSchools,
    subschoolLabels,
    subschoolRules,
    otherTraditions,
    buddhistPlaceTraditions,
    placeTraditionPickerOptions,
    traditionDefaultImages,
  };
}

/** JSON-safe snapshot for passing from server to client components. */
export function serializeOntologySnapshot(snapshot: OntologySnapshot) {
  return {
    buddhistRoot: snapshot.buddhistRoot,
    lineageSchools: snapshot.lineageSchools,
    subschoolLabels: snapshot.subschoolLabels,
    subschoolRules: snapshot.subschoolRules.map((rule) => ({
      slug: rule.slug,
      label: rule.label,
      lineageSchool: rule.lineageSchool,
      placeTraditions: rule.placeTraditions,
      pattern: rule.pattern.source,
    })),
    otherTraditions: snapshot.otherTraditions,
    buddhistPlaceTraditions: snapshot.buddhistPlaceTraditions,
    placeTraditionPickerOptions: snapshot.placeTraditionPickerOptions,
    traditionDefaultImages: snapshot.traditionDefaultImages,
  };
}

export type SerializedOntologySnapshot = ReturnType<typeof serializeOntologySnapshot>;

export function deserializeOntologySnapshot(data: SerializedOntologySnapshot): OntologySnapshot {
  return {
    ...data,
    subschoolRules: data.subschoolRules.map((rule) => ({
      ...rule,
      pattern: new RegExp(rule.pattern, "i"),
    })),
  };
}
