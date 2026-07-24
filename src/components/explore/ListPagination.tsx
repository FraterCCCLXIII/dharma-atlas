"use client";

/** Build a compact page rail like: 1 … 4 5 6 … 20 */
export function getPageRail(
  page: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, page]);
  for (const n of [page - 1, page + 1]) {
    if (n >= 1 && n <= totalPages) pages.add(n);
  }
  if (page <= 3) {
    for (const n of [2, 3, 4]) {
      if (n <= totalPages) pages.add(n);
    }
  }
  if (page >= totalPages - 2) {
    for (const n of [totalPages - 1, totalPages - 2, totalPages - 3]) {
      if (n >= 1) pages.add(n);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const rail: (number | "ellipsis")[] = [];
  for (const n of sorted) {
    const prev = rail[rail.length - 1];
    if (typeof prev === "number" && n - prev > 1) {
      rail.push("ellipsis");
    }
    rail.push(n);
  }
  return rail;
}

export function ListPagination({
  page,
  totalPages,
  onPageChange,
  label = "Pagination",
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  if (totalPages <= 1) return null;

  const rail = getPageRail(page, totalPages);

  return (
    <nav
      aria-label={label}
      className="mt-4 flex items-center justify-between gap-2"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="shrink-0 rounded-full border border-border px-3 py-2 text-sm disabled:opacity-40 sm:px-4"
      >
        Previous
      </button>
      <ol className="flex min-w-0 flex-wrap items-center justify-center gap-1">
        {rail.map((item, index) =>
          item === "ellipsis" ? (
            <li
              key={`ellipsis-${index}`}
              aria-hidden
              className="px-1 text-sm text-ink-muted"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm tabular-nums transition-colors ${
                  item === page
                    ? "bg-brand text-brand-foreground"
                    : "text-ink-secondary hover:bg-surface-muted"
                }`}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ol>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="shrink-0 rounded-full border border-border px-3 py-2 text-sm disabled:opacity-40 sm:px-4"
      >
        Next
      </button>
    </nav>
  );
}
