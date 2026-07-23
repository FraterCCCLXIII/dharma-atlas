"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CaretDown, CirclesThree } from "@phosphor-icons/react";
import {
  TRADITIONS_LIST_PATH,
  traditionProfilePath,
} from "@/lib/explore-routes";
import type { TraditionNavNode } from "@/lib/traditions/tree";

function pathSlug(pathname: string): string | null {
  if (pathname === TRADITIONS_LIST_PATH) return null;
  if (!pathname.startsWith(`${TRADITIONS_LIST_PATH}/`)) return null;
  return pathname.slice(TRADITIONS_LIST_PATH.length + 1) || null;
}

function collectExpanded(
  nodes: TraditionNavNode[],
  activeSlug: string | null,
): Set<string> {
  const expanded = new Set<string>();

  function walk(node: TraditionNavNode, ancestors: string[]): boolean {
    const nextAncestors = [...ancestors, node.slug];
    let matched = node.slug === activeSlug;

    for (const child of node.children) {
      if (walk(child, nextAncestors)) matched = true;
    }

    if (matched) {
      for (const slug of ancestors) expanded.add(slug);
      if (node.children.length > 0) expanded.add(node.slug);
    }

    return matched;
  }

  for (const node of nodes) walk(node, []);
  return expanded;
}

function NavBranch({
  node,
  depth,
  activeSlug,
  expanded,
  onToggle,
  onNavigate,
}: {
  node: TraditionNavNode;
  depth: number;
  activeSlug: string | null;
  expanded: Set<string>;
  onToggle: (slug: string) => void;
  onNavigate?: () => void;
}) {
  const hasChildren = node.children.length > 0;
  const isOpen = expanded.has(node.slug);
  const isActive = activeSlug === node.slug;
  const href = traditionProfilePath(node.slug);

  return (
    <li>
      <div
        className="flex items-center gap-0.5"
        style={{ paddingLeft: depth > 0 ? depth * 12 : 0 }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={isOpen ? `Collapse ${node.label}` : `Expand ${node.label}`}
            onClick={() => onToggle(node.slug)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink"
          >
            <CaretDown
              size={12}
              weight="bold"
              className={`transition-transform ${isOpen ? "" : "-rotate-90"}`}
            />
          </button>
        ) : (
          <span className="inline-block w-7 shrink-0" aria-hidden />
        )}
        <Link
          href={href}
          aria-current={isActive ? "page" : undefined}
          onClick={onNavigate}
          className={`min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-sm transition ${
            isActive
              ? "bg-brand font-semibold text-brand-foreground"
              : "text-ink-secondary hover:bg-surface-muted hover:text-ink"
          }`}
        >
          {node.label}
        </Link>
      </div>
      {hasChildren && isOpen ? (
        <ul className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <NavBranch
              key={child.slug}
              node={child}
              depth={depth + 1}
              activeSlug={activeSlug}
              expanded={expanded}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function TraditionNav({
  forest,
  onNavigate,
}: {
  forest: TraditionNavNode[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activeSlug = pathSlug(pathname);
  const defaultExpanded = useMemo(
    () => collectExpanded(forest, activeSlug),
    [forest, activeSlug],
  );
  const [expanded, setExpanded] = useState<Set<string>>(defaultExpanded);

  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const slug of defaultExpanded) next.add(slug);
      return next;
    });
  }, [defaultExpanded]);

  const onToggle = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const hubActive = pathname === TRADITIONS_LIST_PATH;

  return (
    <nav aria-label="Traditions">
      <Link
        href={TRADITIONS_LIST_PATH}
        aria-current={hubActive ? "page" : undefined}
        onClick={onNavigate}
        className={`mb-3 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold transition ${
          hubActive
            ? "bg-brand text-brand-foreground"
            : "text-ink hover:bg-surface-muted"
        }`}
      >
        <CirclesThree size={16} weight="bold" className="shrink-0" />
        All traditions
      </Link>
      <ul className="space-y-0.5">
        {forest.map((node) => (
          <NavBranch
            key={node.slug}
            node={node}
            depth={0}
            activeSlug={activeSlug}
            expanded={expanded}
            onToggle={onToggle}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </nav>
  );
}
