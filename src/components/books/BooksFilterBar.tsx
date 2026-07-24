"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CaretDown, Check, MagnifyingGlass, X } from "@phosphor-icons/react";
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

function PublisherMultiSelect({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (publisher: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selectedSet = new Set(selected);

  const summary =
    selected.length === 0
      ? "All publishers"
      : selected.length === 1
        ? selected[0]
        : `${selected.length} publishers`;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target)) close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  return (
    <div ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm text-ink transition hover:border-border-strong focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-brand/20"
      >
        <span
          className={`min-w-0 truncate ${
            selected.length === 0 ? "text-ink-muted" : "font-medium"
          }`}
        >
          {summary}
        </span>
        <CaretDown
          size={14}
          weight="bold"
          className={`shrink-0 text-ink-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          aria-label="Publishers"
          className="mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-border bg-surface-elevated py-1 shadow-[var(--shadow-float)]"
        >
          {BOOK_PUBLISHERS.map((publisher) => {
            const active = selectedSet.has(publisher);
            return (
              <button
                key={publisher}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onToggle(publisher)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition hover:bg-surface-muted ${
                  active ? "text-ink" : "text-ink-secondary"
                }`}
              >
                <span
                  aria-hidden
                  className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    active
                      ? "border-accent bg-accent text-brand-foreground"
                      : "border-border bg-surface"
                  }`}
                >
                  {active ? <Check size={11} weight="bold" /> : null}
                </span>
                <span className="min-w-0 flex-1">{publisher}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {selected.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((publisher) => (
            <button
              key={publisher}
              type="button"
              onClick={() => onToggle(publisher)}
              aria-label={`Remove ${publisher}`}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-secondary transition hover:border-border-strong hover:text-ink"
            >
              <span className="truncate">{publisher}</span>
              <X size={11} weight="bold" className="shrink-0" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
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
          <PublisherMultiSelect
            selected={publishers}
            onToggle={togglePublisher}
          />
        </FilterSection>
      </div>
    </nav>
  );
}
