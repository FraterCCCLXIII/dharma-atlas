"use client";

import type { ReactNode } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

/**
 * Flat mobile strip under the map: optional control row + horizontal results.
 * Horizontal inset comes from the parent (same px as the map panel).
 */
export function MobileMapResultsPanel({
  leading,
  trailing,
  children,
  empty,
}: {
  leading?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
  empty?: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      {leading || trailing ? (
        <div className="flex h-10 shrink-0 items-center gap-1.5 pt-1">
          {leading ? (
            <div className="min-w-0 flex-1 overflow-x-auto">{leading}</div>
          ) : (
            <div className="min-w-0 flex-1" />
          )}
          {trailing}
        </div>
      ) : null}
      {children ? (
        <div className="-mx-3 min-h-0 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-3 pt-1.5 sm:-mx-4">
          <div className="flex w-max items-stretch gap-2.5 px-3 sm:px-4">
            {children}
          </div>
        </div>
      ) : empty ? (
        <div className="pb-3 pt-1.5 text-sm text-ink-muted">{empty}</div>
      ) : null}
    </div>
  );
}

export function MobileMapPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return (
      <span className="shrink-0 px-1 text-xs tabular-nums text-ink-muted">
        {page} / {Math.max(totalPages, 1)}
      </span>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition hover:bg-surface-muted hover:text-ink disabled:opacity-35"
      >
        <CaretLeft size={16} weight="bold" />
      </button>
      <span className="min-w-[3.25rem] text-center text-xs font-medium tabular-nums text-ink">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition hover:bg-surface-muted hover:text-ink disabled:opacity-35"
      >
        <CaretRight size={16} weight="bold" />
      </button>
    </div>
  );
}
