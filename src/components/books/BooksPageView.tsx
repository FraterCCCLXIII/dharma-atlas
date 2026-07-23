"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen } from "@phosphor-icons/react";
import { AMAZON_BOOKS } from "@/data/amazon-books";
import { amazonProductUrl, bookCoverUrl } from "@/lib/amazon";
import { cardLiftClassName } from "@/lib/card-styles";
import {
  useBooksActiveFilterCount,
  useBooksStore,
} from "@/store/books-store";
import { BooksFilterBar } from "./BooksFilterBar";

function useDesktopLayout() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

function BooksFilterSidebar({
  filtersOpen,
  onClose,
}: {
  filtersOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {filtersOpen && (
        <button
          type="button"
          aria-label="Close filters"
          className="absolute inset-0 z-10 bg-ink/20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`flex shrink-0 flex-col overflow-hidden border-r border-border bg-surface-elevated transition-[width] duration-200 ease-out max-lg:absolute max-lg:inset-y-0 max-lg:left-0 max-lg:z-20 max-lg:w-[min(100%,18rem)] max-lg:shadow-[var(--shadow-card)] lg:relative lg:z-auto ${
          filtersOpen
            ? "lg:w-72"
            : "max-lg:hidden lg:w-0 lg:border-r-0"
        }`}
        aria-hidden={!filtersOpen}
      >
        <BooksFilterBar onClose={onClose} />
      </aside>
    </>
  );
}

export function BooksPageView() {
  const isDesktop = useDesktopLayout();
  const filtersOpen = useBooksStore((s) => s.filtersOpen);
  const setFiltersOpen = useBooksStore((s) => s.setFiltersOpen);
  const topics = useBooksStore((s) => s.topics);
  const publishers = useBooksStore((s) => s.publishers);
  const query = useBooksStore((s) => s.query);
  const activeFilterCount = useBooksActiveFilterCount();

  useEffect(() => {
    setFiltersOpen(isDesktop);
  }, [isDesktop, setFiltersOpen]);

  const books = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return AMAZON_BOOKS.filter((book) => {
      if (topics.length > 0 && !topics.includes(book.topic)) return false;
      if (publishers.length > 0 && !publishers.includes(book.publisher)) {
        return false;
      }
      if (!normalizedQuery) return true;

      return (
        book.title.toLowerCase().includes(normalizedQuery) ||
        book.author.toLowerCase().includes(normalizedQuery) ||
        book.publisher.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [topics, publishers, query]);

  return (
    <div className="relative flex h-full min-h-0 flex-1 overflow-hidden bg-surface">
      <BooksFilterSidebar
        filtersOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      />

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
              <BookOpen size={14} weight="bold" />
              Reading list
            </p>
            <h1 className="mt-2 flex flex-wrap items-center gap-2.5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Books
              <span className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                Beta
              </span>
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-secondary">
              A curated shelf of popular and foundational texts across Buddhist,
              Hindu, and contemplative traditions — with strong coverage from
              Shambhala, Wisdom, and related presses. Covers and purchase links
              open on Amazon.
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Showing {books.length} of {AMAZON_BOOKS.length}
              {activeFilterCount > 0 ? " matching filters" : " titles"}
            </p>
          </div>

          {books.length === 0 ? (
            <p className="mt-12 text-sm text-ink-secondary">
              No books match these filters. Try clearing a topic or publisher.
            </p>
          ) : (
            <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 xl:grid-cols-5">
              {books.map((book) => {
                const href = amazonProductUrl(book.asin);
                const imageSrc = bookCoverUrl(book);
                return (
                  <li key={book.asin}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-[var(--shadow-card)] ${cardLiftClassName}`}
                    >
                      <div className="flex aspect-[2/3] items-center justify-center bg-surface-muted p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element -- remote OL covers; keep true vertical centering */}
                        <img
                          src={imageSrc}
                          alt={`Cover of ${book.title}`}
                          className="max-h-full max-w-full object-contain object-center drop-shadow-md transition duration-300 group-hover:scale-[1.02]"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-1.5 px-3.5 pb-3.5 pt-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                          {book.topic}
                        </p>
                        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
                          {book.title}
                        </h2>
                        <p className="line-clamp-1 text-xs text-ink-muted">
                          {book.author}
                        </p>
                        <p className="line-clamp-1 text-[11px] text-ink-muted/80">
                          {book.publisher}
                        </p>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
