import Link from "next/link";
import type { Teacher } from "@/types/teacher";

export function PlaceTeachersSection({ teachers }: { teachers: Teacher[] }) {
  if (teachers.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-ink">
        Teachers & programs
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {teachers.map((teacher) => (
          <li key={teacher.slug}>
            <Link
              href={`/person/${teacher.slug}`}
              className="block rounded-xl border border-border bg-surface-elevated p-4 transition hover:border-brand/30"
            >
              <p className="font-medium text-ink">{teacher.name}</p>
              <p className="mt-1 text-sm text-ink-secondary">
                {teacher.tradition}
                {teacher.lineage ? ` · ${teacher.lineage}` : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
