import Link from "next/link";
import { getPlacesCount, getPublishRequestedCount } from "@/lib/data/places";
import { getTeachersCount } from "@/lib/data/teachers";
import { getPendingClaimsCount } from "@/lib/data/claims";
import { getPendingReportsCount } from "@/lib/data/reports";
import { getPendingSubmissionsCount } from "@/lib/data/submissions";

export default async function AdminDashboardPage() {
  const [teacherCount, placeCount, pendingSubmissions, pendingClaims, pendingReports, publishRequests] =
    await Promise.all([
    getTeachersCount(),
    getPlacesCount(),
    getPendingSubmissionsCount(),
    getPendingClaimsCount(),
    getPendingReportsCount(),
    getPublishRequestedCount(),
  ]);

  const cards = [
    { label: "Teachers", count: teacherCount, href: "/admin/teachers" },
    { label: "Locations", count: placeCount, href: "/admin/places" },
    {
      label: "Pending submissions",
      count: pendingSubmissions,
      href: "/admin/submissions",
    },
    {
      label: "Pending claims",
      count: pendingClaims,
      href: "/admin/claims",
    },
    {
      label: "Publish requests",
      count: publishRequests,
      href: "/admin/places?draft=1",
    },
    {
      label: "Pending reports",
      count: pendingReports,
      href: "/admin/reports",
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

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
