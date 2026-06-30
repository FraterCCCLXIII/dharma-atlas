"use client";

import Link from "next/link";
import { CaretRight, DotsSixVertical } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { fieldClassName, FormField } from "@/components/forms/FormField";
import {
  resetOntologyAction,
  saveOntologyAction,
} from "@/app/admin/actions/ontology";
import { BUDDHIST_FILTER_ID } from "@/lib/ontology/defaults";
import {
  isDirectChildOfRoot,
  isNestedNode,
  isRootNode,
  syncOntologyNodeTypes,
} from "@/lib/ontology/sync-node-types";
import {
  canDropOntologyNode,
  dropModeLabel,
  getDropMode,
  moveOntologyNode,
  type DropMode,
} from "@/lib/ontology/tree-move";
import type { OntologyNode } from "@/types/ontology";

type TreeNode = OntologyNode & { children: TreeNode[] };

function buildTree(nodes: OntologyNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  for (const node of nodes) {
    map.set(node.slug, { ...node, children: [] });
  }

  const roots: TreeNode[] = [];
  for (const node of nodes) {
    const current = map.get(node.slug)!;
    if (node.parentSlug && map.has(node.parentSlug)) {
      map.get(node.parentSlug)!.children.push(current);
    } else {
      roots.push(current);
    }
  }

  const sortNodes = (items: TreeNode[]) => {
    items.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
    for (const item of items) sortNodes(item.children);
  };
  sortNodes(roots);
  return roots;
}

function flattenTree(nodes: TreeNode[]): OntologyNode[] {
  const result: OntologyNode[] = [];
  const walk = (items: TreeNode[]) => {
    for (const item of items) {
      const { children, ...node } = item;
      result.push({ ...node, sortOrder: result.length });
      walk(children);
    }
  };
  walk(nodes);
  return result;
}

function getAncestorSlugs(slug: string, nodes: OntologyNode[]): string[] {
  const ancestors: string[] = [];
  let current = nodes.find((node) => node.slug === slug);
  while (current?.parentSlug) {
    ancestors.push(current.parentSlug);
    current = nodes.find((node) => node.slug === current!.parentSlug);
  }
  return ancestors;
}

function TreeRow({
  node,
  depth,
  nodes,
  selectedSlug,
  draggingSlug,
  dropTarget,
  collapsedSlugs,
  onSelect,
  onToggleCollapse,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onMove,
}: {
  node: TreeNode;
  depth: number;
  nodes: OntologyNode[];
  selectedSlug: string | null;
  draggingSlug: string | null;
  dropTarget: { slug: string; mode: DropMode; allowed: boolean } | null;
  collapsedSlugs: Set<string>;
  onSelect: (slug: string) => void;
  onToggleCollapse: (slug: string) => void;
  onDragStart: (slug: string) => void;
  onDragEnd: () => void;
  onDragOver: (slug: string, mode: DropMode, allowed: boolean) => void;
  onDragLeave: (slug: string) => void;
  onDrop: () => void;
  onMove: (draggedSlug: string, targetSlug: string, mode: DropMode) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = hasChildren && !collapsedSlugs.has(node.slug);
  const isDragging = draggingSlug === node.slug;
  const isTarget = dropTarget?.slug === node.slug && !isDragging && dropTarget.allowed;
  const showBefore = isTarget && dropTarget.mode === "before";
  const showAfter = isTarget && dropTarget.mode === "after";
  const showInside = isTarget && dropTarget.mode === "inside";

  return (
    <li className="list-none">
      <div className="relative rounded-lg transition">
        {showBefore && (
          <span
            aria-hidden
            className="absolute inset-x-2 top-0 z-10 h-0.5 -translate-y-1/2 rounded-full bg-brand"
          />
        )}
        {showAfter && (
          <span
            aria-hidden
            className="absolute inset-x-2 bottom-0 z-10 h-0.5 translate-y-1/2 rounded-full bg-brand"
          />
        )}
        <div
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", node.slug);
            onDragStart(node.slug);
          }}
          onDragEnd={onDragEnd}
          onDragOver={(event) => {
            event.preventDefault();
            const draggedSlug = draggingSlug ?? event.dataTransfer.getData("text/plain");
            if (!draggedSlug || draggedSlug === node.slug) return;

            const mode = getDropMode(event);
            const allowed = canDropOntologyNode(nodes, draggedSlug, node.slug, mode);
            event.dataTransfer.dropEffect = allowed ? "move" : "none";
            onDragOver(node.slug, mode, allowed);
          }}
          onDragLeave={() => onDragLeave(node.slug)}
          onDrop={(event) => {
            event.preventDefault();
            const draggedSlug = event.dataTransfer.getData("text/plain");
            if (draggedSlug && draggedSlug !== node.slug) {
              onMove(draggedSlug, node.slug, getDropMode(event));
            }
            onDrop();
          }}
          className={`relative flex items-center gap-1 rounded-lg border-2 transition ${
            isDragging ? "opacity-40" : ""
          } ${
            showInside
              ? "border-brand bg-brand/10"
              : selectedSlug === node.slug
                ? "border-transparent bg-brand/10"
                : "border-transparent hover:bg-surface-muted"
          }`}
          style={{ paddingLeft: `${depth * 12 + 4}px` }}
        >
          {showInside && (
            <span className="pointer-events-none absolute inset-x-3 top-1 text-[11px] font-medium text-brand">
              {dropModeLabel("inside")}
            </span>
          )}
          <span
            className="flex shrink-0 touch-none cursor-grab p-1 text-ink-muted active:cursor-grabbing"
            aria-hidden
          >
            <DotsSixVertical size={14} weight="bold" />
          </span>
          <button
            type="button"
            onClick={() => onSelect(node.slug)}
            className={`min-w-0 flex-1 py-1.5 pr-2 text-left text-sm transition ${
              selectedSlug === node.slug ? "text-brand" : "text-ink-secondary hover:text-ink"
            }`}
          >
            <span className="block truncate font-medium">{node.label}</span>
          </button>
          {hasChildren && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleCollapse(node.slug);
              }}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.label}`}
              className="mr-1 flex shrink-0 items-center justify-center rounded p-1 text-ink-muted transition hover:bg-surface-muted hover:text-ink"
            >
              <CaretRight
                size={14}
                weight="bold"
                className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>
          )}
        </div>
      </div>
      {isExpanded && (
        <TreeList
          nodes={node.children}
          depth={depth + 1}
          allNodes={nodes}
          selectedSlug={selectedSlug}
          draggingSlug={draggingSlug}
          dropTarget={dropTarget}
          collapsedSlugs={collapsedSlugs}
          onSelect={onSelect}
          onToggleCollapse={onToggleCollapse}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onMove={onMove}
        />
      )}
    </li>
  );
}

function TreeList({
  nodes,
  depth,
  allNodes,
  selectedSlug,
  draggingSlug,
  dropTarget,
  collapsedSlugs,
  onSelect,
  onToggleCollapse,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onMove,
}: {
  nodes: TreeNode[];
  depth: number;
  allNodes: OntologyNode[];
  selectedSlug: string | null;
  draggingSlug: string | null;
  dropTarget: { slug: string; mode: DropMode; allowed: boolean } | null;
  collapsedSlugs: Set<string>;
  onSelect: (slug: string) => void;
  onToggleCollapse: (slug: string) => void;
  onDragStart: (slug: string) => void;
  onDragEnd: () => void;
  onDragOver: (slug: string, mode: DropMode, allowed: boolean) => void;
  onDragLeave: (slug: string) => void;
  onDrop: () => void;
  onMove: (draggedSlug: string, targetSlug: string, mode: DropMode) => void;
}) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => (
        <TreeRow
          key={node.slug}
          node={node}
          depth={depth}
          nodes={allNodes}
          selectedSlug={selectedSlug}
          draggingSlug={draggingSlug}
          dropTarget={dropTarget}
          collapsedSlugs={collapsedSlugs}
          onSelect={onSelect}
          onToggleCollapse={onToggleCollapse}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onMove={onMove}
        />
      ))}
    </ul>
  );
}

interface OntologyEditorProps {
  initialNodes: OntologyNode[];
}

export function OntologyEditor({ initialNodes }: OntologyEditorProps) {
  const [nodes, setNodes] = useState<OntologyNode[]>(() => syncOntologyNodeTypes(initialNodes));
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialNodes[0]?.slug ?? null);
  const [draggingSlug, setDraggingSlug] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ slug: string; mode: DropMode; allowed: boolean } | null>(
    null,
  );
  const [collapsedSlugs, setCollapsedSlugs] = useState<Set<string>>(() => new Set());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const tree = useMemo(() => buildTree(nodes), [nodes]);
  const selected = nodes.find((node) => node.slug === selectedSlug) ?? null;

  function updateNode(slug: string, patch: Partial<OntologyNode>) {
    setNodes((current) =>
      syncOntologyNodeTypes(
        current.map((node) => (node.slug === slug ? { ...node, ...patch } : node)),
      ),
    );
  }

  function addNode(parent: OntologyNode | null) {
    const slug = `new-node-${Date.now()}`;
    const next: OntologyNode = {
      slug,
      label: "New node",
      parentSlug: parent?.slug ?? null,
      sortOrder: nodes.length,
      nodeType: "tradition",
      filterId: slug,
      placeTraditions: [],
      inferPattern: null,
      appliesToLocations: true,
      appliesToPeople: true,
    };
    setNodes((current) => syncOntologyNodeTypes([...current, next]));
    if (parent) {
      setCollapsedSlugs((current) => {
        const nextCollapsed = new Set(current);
        nextCollapsed.delete(parent.slug);
        return nextCollapsed;
      });
    }
    setSelectedSlug(slug);
  }

  function handleAdd() {
    addNode(selected);
  }

  function toggleCollapse(slug: string) {
    setCollapsedSlugs((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function selectNode(slug: string) {
    setSelectedSlug(slug);
    setCollapsedSlugs((current) => {
      const next = new Set(current);
      for (const ancestor of getAncestorSlugs(slug, nodes)) {
        next.delete(ancestor);
      }
      return next;
    });
  }

  function deleteNode(slug: string) {
    const toDelete = new Set<string>([slug]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const node of nodes) {
        if (node.parentSlug && toDelete.has(node.parentSlug) && !toDelete.has(node.slug)) {
          toDelete.add(node.slug);
          changed = true;
        }
      }
    }

    setNodes((current) => syncOntologyNodeTypes(current.filter((node) => !toDelete.has(node.slug))));
    if (selectedSlug && toDelete.has(selectedSlug)) {
      setSelectedSlug(null);
    }
  }

  function handleMove(draggedSlug: string, targetSlug: string, mode: DropMode) {
    const result = moveOntologyNode(nodes, draggedSlug, targetSlug, mode);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError("");
    setNodes(result.nodes);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const payload = syncOntologyNodeTypes(flattenTree(buildTree(nodes)));
      await saveOntologyAction({ nodes: payload });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm("Reset ontology to defaults? This replaces all nodes.")) return;
    setSaving(true);
    setError("");
    try {
      await resetOntologyAction();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
      setSaving(false);
    }
  }

  const showPlaceTraditions =
    selected != null && (isDirectChildOfRoot(selected, nodes) || isNestedNode(selected));
  const showInferPattern = selected != null && isNestedNode(selected);
  const isBuddhismBranch = selected != null && selected.filterId === BUDDHIST_FILTER_ID;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-xs text-ink-muted hover:text-ink">
          ← Dashboard
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold">
          Ontology
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Build a nested hierarchy for filters on locations and people. Use Add to create a top-level
          node, or select a node first to add a child. Drag to reorder, nest, or unnest — children
          always follow their parent.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="rounded-2xl border border-border bg-surface-elevated p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-ink">Tree</h2>
              <p className="text-xs text-ink-muted">
                {dropTarget?.allowed === false
                  ? "That drop is not allowed here"
                  : dropTarget
                    ? dropModeLabel(dropTarget.mode)
                    : "Drag using the handle"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-ink-secondary transition hover:bg-surface-muted"
            >
              Add
            </button>
          </div>
          <TreeList
            nodes={tree}
            depth={0}
            allNodes={nodes}
            selectedSlug={selectedSlug}
            draggingSlug={draggingSlug}
            dropTarget={dropTarget}
            collapsedSlugs={collapsedSlugs}
            onSelect={selectNode}
            onToggleCollapse={toggleCollapse}
            onDragStart={(slug) => {
              setError("");
              setDraggingSlug(slug);
            }}
            onDragEnd={() => {
              setDraggingSlug(null);
              setDropTarget(null);
            }}
            onDragOver={(slug, mode, allowed) => setDropTarget({ slug, mode, allowed })}
            onDragLeave={(slug) => {
              setDropTarget((current) => (current?.slug === slug ? null : current));
            }}
            onDrop={() => {
              setDraggingSlug(null);
              setDropTarget(null);
            }}
            onMove={handleMove}
          />
        </section>

        <section className="rounded-2xl border border-border bg-surface-elevated p-4">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-ink">{selected.label}</h2>
                  <p className="text-xs text-ink-muted">
                    {isBuddhismBranch
                      ? "Umbrella node for the Buddhist filter tree (filter ID must stay Buddhist)"
                      : isRootNode(selected)
                        ? "Top-level node"
                        : "Nested node"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteNode(selected.slug)}
                  className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </div>

              <FormField id="node-label" label="Label">
                <input
                  id="node-label"
                  value={selected.label}
                  onChange={(e) => updateNode(selected.slug, { label: e.target.value })}
                  className={fieldClassName}
                />
              </FormField>

              <FormField id="node-slug" label="Slug">
                <input
                  id="node-slug"
                  value={selected.slug}
                  onChange={(e) => updateNode(selected.slug, { slug: e.target.value })}
                  className={fieldClassName}
                />
              </FormField>

              <FormField id="node-filter-id" label="Filter ID">
                <p className="mb-2 text-xs text-ink-muted">
                  Value used in explore filters and place/teacher data matching.
                </p>
                <input
                  id="node-filter-id"
                  value={selected.filterId}
                  onChange={(e) => updateNode(selected.slug, { filterId: e.target.value })}
                  className={fieldClassName}
                />
              </FormField>

              {showPlaceTraditions && (
                <FormField id="place-traditions" label="Location tradition values">
                  <p className="mb-2 text-xs text-ink-muted">
                    Place tradition strings that map to this node (comma-separated).
                  </p>
                  <input
                    id="place-traditions"
                    value={selected.placeTraditions.join(", ")}
                    onChange={(e) =>
                      updateNode(selected.slug, {
                        placeTraditions: e.target.value
                          .split(",")
                          .map((value) => value.trim())
                          .filter(Boolean),
                      })
                    }
                    className={fieldClassName}
                    placeholder="Tibetan, Zen"
                  />
                </FormField>
              )}

              {showInferPattern && (
                <FormField id="infer-pattern" label="Inference pattern">
                  <p className="mb-2 text-xs text-ink-muted">
                    Optional regex matched against location names and teacher text.
                  </p>
                  <textarea
                    id="infer-pattern"
                    rows={3}
                    value={selected.inferPattern ?? ""}
                    onChange={(e) =>
                      updateNode(selected.slug, {
                        inferPattern: e.target.value.trim() || null,
                      })
                    }
                    className={`${fieldClassName} resize-y font-mono text-xs`}
                  />
                </FormField>
              )}

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm text-ink-secondary">
                  <input
                    type="checkbox"
                    checked={selected.appliesToLocations}
                    onChange={(e) =>
                      updateNode(selected.slug, { appliesToLocations: e.target.checked })
                    }
                  />
                  Used for locations
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-secondary">
                  <input
                    type="checkbox"
                    checked={selected.appliesToPeople}
                    onChange={(e) =>
                      updateNode(selected.slug, { appliesToPeople: e.target.checked })
                    }
                  />
                  Used for people
                </label>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">Select a node to edit it.</p>
          )}
        </section>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save ontology"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink-secondary transition hover:bg-surface-muted disabled:opacity-50"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
