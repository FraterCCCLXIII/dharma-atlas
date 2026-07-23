"use client";

import type { ReactNode } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { BOOK_PUBLISHERS, BOOK_TOPICS } from "@/data/amazon-books";
import {
  useBooksActiveFilterCount,
  useBooksStore,
} from "@/store/books-store";

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

export function BooksFilterBar({ onClose }: { onClose?: () => void }) {
  const topics = useBooksStore((s) => s.topics);
  const publishers = useBooksStore((s) => s.publishers);
  const query = useBooksStore((s) => s.query);
  const toggleTopic = useBooksStore((s) => s.toggleTopic);
  const togglePublisher = useBooksStore((s) => s.togglePublisher);
  const setQuery = useBooksStore((s) => s.setQuery);
  const clearFilters = useBooksStore((s) => s.clearFilters);
  const activeFilterCount = useBooksActiveFilterCount();

  return (
    <nav
      id="books-filters"
      aria-label="Book filters"
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
              placeholder="Title or author"
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </span>
        </label>

        <FilterSection title="Topic">
          {BOOK_TOPICS.map((topic) => (
            <FilterChip
              key={topic}
              label={topic}
              active={topics.includes(topic)}
              onClick={() => toggleTopic(topic)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Publisher">
          {BOOK_PUBLISHERS.map((publisher) => (
            <FilterChip
              key={publisher}
              label={publisher}
              active={publishers.includes(publisher)}
              onClick={() => togglePublisher(publisher)}
            />
          ))}
        </FilterSection>
      </div>
    </nav>
  );
}
