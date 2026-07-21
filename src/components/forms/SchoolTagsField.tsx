"use client";

import { useMemo } from "react";
import {
  getSubschoolLabelMap,
  inferSchools,
  subschoolLabel,
} from "@/lib/schools";

export function getKnownSchoolSlugs(): string[] {
  return Object.keys(getSubschoolLabelMap()).sort((a, b) =>
    subschoolLabel(a).localeCompare(subschoolLabel(b)),
  );
}

interface SchoolTagsFieldProps {
  name: string;
  tradition: string;
  value: string[];
  onChange: (schools: string[]) => void;
  /** When true, show slug monospace hints (admin). */
  showSlugs?: boolean;
}

export function SchoolTagsField({
  name,
  tradition,
  value,
  onChange,
  showSlugs = false,
}: SchoolTagsFieldProps) {
  const knownSchoolSlugs = getKnownSchoolSlugs();
  const inferredSchools = useMemo(
    () => inferSchools({ name, tradition }),
    [name, tradition],
  );

  function toggleSchool(slug: string) {
    const next = new Set(value);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    onChange([...next].sort());
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-muted">
        Optional school tags. When empty, schools may still be inferred from the name on the
        public site.
      </p>
      {inferredSchools.length > 0 && (
        <p className="text-xs text-ink-muted">
          Inferred from name:{" "}
          {inferredSchools.map((slug) => subschoolLabel(slug)).join(", ")}
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {knownSchoolSlugs.map((slug) => (
          <label
            key={slug}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-surface-muted"
          >
            <input
              type="checkbox"
              checked={value.includes(slug)}
              onChange={() => toggleSchool(slug)}
              className="rounded border-border text-brand focus:ring-brand/30"
            />
            <span>{subschoolLabel(slug)}</span>
            {showSlugs && (
              <span className="ml-auto font-mono text-[11px] text-ink-muted">{slug}</span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
