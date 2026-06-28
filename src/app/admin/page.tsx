import Link from "next/link";
import { getPlacesCount } from "@/lib/data/places";
import { getTeachersCount } from "@/lib/data/teachers";
import { getPendingSubmissionsCount } from "@/lib/data/submissions";

export default async function AdminDashboardPage() {
  const [teacherCount, placeCount, pendingCount] = await Promise.all([
    getTeachersCount(),
    getPlacesCount(),
    getPendingSubmissionsCount(),
  ]);

  const cards = [
    { label: "Teachers", count: teacherCount, href: "/admin/teachers" },
    { label: "Locations", count: placeCount, href: "/admin/places" },
    {
      label: "Pending submissions",
      count: pendingCount,
      href: "/admin/submissions",
    },
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Manage directory content, review submissions, and publish updates.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-[var(--shadow-card)] transition hover:border-brand/30"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
              {card.label}
            </p>
            <p className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl font-semibold text-ink">
              {card.count}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
