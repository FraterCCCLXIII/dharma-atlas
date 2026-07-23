"use client";

import type { ReactNode } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import {
  PILGRIMAGE_REGIONS,
  PILGRIMAGE_TRADITIONS,
} from "@/data/pilgrimage";
import {
  usePilgrimageActiveFilterCount,
  usePilgrimageStore,
} from "@/store/pilgrimage-store";

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex w-full items-center rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
        active
          ? "border-accent bg-accent text-brand-foreground shadow-sm"
          : "border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

export function PilgrimageFilterBar({ onClose }: { onClose?: () => void }) {
  const regions = usePilgrimageStore((s) => s.regions);
  const traditions = usePilgrimageStore((s) => s.traditions);
  const query = usePilgrimageStore((s) => s.query);
  const toggleRegion = usePilgrimageStore((s) => s.toggleRegion);
  const toggleTradition = usePilgrimageStore((s) => s.toggleTradition);
  const clearRegions = usePilgrimageStore((s) => s.clearRegions);
  const clearTraditions = usePilgrimageStore((s) => s.clearTraditions);
  const setQuery = usePilgrimageStore((s) => s.setQuery);
  const clearFilters = usePilgrimageStore((s) => s.clearFilters);
  const activeFilterCount = usePilgrimageActiveFilterCount();

  return (
    <nav
      id="pilgrimage-filters"
      aria-label="Pilgrimage filters"
      className="flex h-full flex-col bg-surface-elevated"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-ink">Filters</p>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-brand underline-offset-2 hover:underline"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
              aria-label="Close filters"
            >
              <X size={16} weight="bold" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <label className="block space-y-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
            Search
          </span>
          <span className="relative flex items-center">
            <MagnifyingGlass
              size={16}
              weight="bold"
              className="pointer-events-none absolute left-3 text-ink-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Site or route name"
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </span>
        </label>

        <FilterSection title="Region">
          <FilterChip
            label="All"
            active={regions.length === 0}
            onClick={clearRegions}
          />
          {PILGRIMAGE_REGIONS.map((region) => (
            <FilterChip
              key={region}
              label={region}
              active={regions.includes(region)}
              onClick={() => toggleRegion(region)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Tradition">
          <FilterChip
            label="All"
            active={traditions.length === 0}
            onClick={clearTraditions}
          />
          {PILGRIMAGE_TRADITIONS.map((tradition) => (
            <FilterChip
              key={tradition}
              label={tradition}
              active={traditions.includes(tradition)}
              onClick={() => toggleTradition(tradition)}
            />
          ))}
        </FilterSection>
      </div>
    </nav>
  );
}
