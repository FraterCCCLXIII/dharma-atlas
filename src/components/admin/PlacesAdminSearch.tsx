"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Place } from "@/types/place";

export function PlacesAdminSearch({
  places,
  total,
  page,
  pageSize,
  initialQuery,
}: {
  places: Place[];
  total: number;
  page: number;
  pageSize: number;
  initialQuery: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function navigate(nextPage: number, nextQuery?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    const q = nextQuery ?? query;
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    router.push(`/admin/places?${params.toString()}`);
  }

  const showing = useMemo(() => {
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return { start, end };
  }, [page, pageSize, total]);

  return (
    <>
      <form
        className="mb-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(1, query);
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, tradition, address…"
          className="min-w-0 flex-1 border-b border-border bg-transparent py-2.5 text-sm outline-none placeholder:text-ink-muted focus:border-brand"
        />
        <button
          type="submit"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-surface-muted"
        >
          Search
        </button>
      </form>

      <p className="mb-4 text-xs text-ink-muted">
        Showing {showing.start}–{showing.end} of {total}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                Name
              </th>
              <th className="py-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                Type
              </th>
              <th className="py-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                Tradition
              </th>
              <th className="py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                Address
              </th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {places.map((p) => (
              <tr key={p.id} className="border-b border-border/60 hover:bg-surface-muted/50">
                <td className="py-3 pr-4 font-medium">{p.name}</td>
                <td className="py-3 pr-4 text-ink-secondary">{p.type}</td>
                <td className="py-3 pr-4 text-ink-secondary">{p.tradition}</td>
                <td className="max-w-xs truncate py-3 text-ink-secondary">{p.address}</td>
                <td className="py-3 text-right whitespace-nowrap">
                  <Link
                    href={`/place/${p.id}`}
                    className="mr-3 text-xs text-ink-muted hover:text-ink"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/places/${p.id}/edit`}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => navigate(page - 1)}
          className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-xs text-ink-muted">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => navigate(page + 1)}
          className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </>
  );
}
