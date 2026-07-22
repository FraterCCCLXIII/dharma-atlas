"use client";

import { useMemo, useState } from "react";
import { BookOpen } from "@phosphor-icons/react";
import { AMAZON_BOOKS, BOOK_TOPICS } from "@/data/amazon-books";
import { amazonProductUrl, bookCoverUrl } from "@/lib/amazon";
import { cardLiftClassName } from "@/lib/card-styles";

export function BooksPageView() {
  const [topic, setTopic] = useState<(typeof BOOK_TOPICS)[number]>("All");

  const books = useMemo(
    () =>
      topic === "All"
        ? AMAZON_BOOKS
        : AMAZON_BOOKS.filter((book) => book.topic === topic),
    [topic],
  );

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-8 sm:px-6 lg:px-8">
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
            Hindu, and contemplative traditions. Covers and purchase links open
            on Amazon.
          </p>
        </div>

        <div
          className="mt-8 flex flex-wrap gap-1.5"
          role="group"
          aria-label="Filter books by topic"
        >
          {BOOK_TOPICS.map((entry) => {
            const active = topic === entry;
            return (
              <button
                key={entry}
                type="button"
                onClick={() => setTopic(entry)}
                aria-pressed={active}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                  active
                    ? "bg-brand text-brand-foreground"
                    : "bg-surface-muted text-ink-secondary hover:bg-border/60 hover:text-ink"
                }`}
              >
                {entry}
              </button>
            );
          })}
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
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
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
