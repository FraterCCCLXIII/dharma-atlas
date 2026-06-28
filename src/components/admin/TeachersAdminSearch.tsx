"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Teacher } from "@/types/teacher";

export function TeachersAdminSearch({ teachers }: { teachers: Teacher[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.tradition.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q),
    );
  }, [teachers, query]);

  return (
    <>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, tradition, location…"
        className="mb-6 w-full border-b border-border bg-transparent py-2.5 text-sm outline-none placeholder:text-ink-muted focus:border-brand"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                Name
              </th>
              <th className="py-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                Tradition
              </th>
              <th className="py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                Location
              </th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.slug} className="border-b border-border/60 hover:bg-surface-muted/50">
                <td className="py-3 pr-4 font-medium">{t.name}</td>
                <td className="py-3 pr-4 text-ink-secondary">{t.tradition}</td>
                <td className="py-3 text-ink-secondary">{t.location}</td>
                <td className="py-3 text-right">
                  <Link
                    href={`/admin/teachers/${t.slug}/edit`}
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

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-ink-muted">No teachers match your search.</p>
      )}
    </>
  );
}
