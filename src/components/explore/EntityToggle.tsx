"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { entityFilterFromPath, pathFromEntityFilter } from "@/lib/explore-routes";
import type { EntityFilter } from "@/store/explore-store";

const OPTIONS: { value: EntityFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "locations", label: "Locations" },
  { value: "people", label: "People" },
];

export function EntityToggle() {
  const pathname = usePathname();
  const entityFilter = entityFilterFromPath(pathname);

  return (
    <div
      role="group"
      aria-label="Directory type"
      className="flex shrink-0 rounded-full border border-border bg-surface p-0.5 shadow-[var(--shadow-card)]"
    >
      {OPTIONS.map(({ value, label }) => {
        const active = entityFilter === value;
        return (
          <Link
            key={value}
            href={pathFromEntityFilter(value)}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-center text-xs font-semibold transition sm:px-3 sm:text-sm ${
              active
                ? "bg-brand text-brand-foreground shadow-sm"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export function getSearchPlaceholder(entityFilter: EntityFilter): string {
  switch (entityFilter) {
    case "locations":
      return "Search temples & monasteries";
    case "people":
      return "Search teachers";
    default:
      return "Search locations & teachers";
  }
}
