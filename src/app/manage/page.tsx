import type { Metadata } from "next";
import Link from "next/link";
import { getPlacesForUser } from "@/lib/data/memberships";
import { getSession } from "@/lib/auth-server";
import { isAdminRole } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Your listings | Dharma Atlas",
  robots: { index: false, follow: false },
};

export default async function ManageDashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const places = await getPlacesForUser(session.user.id);

  return (
    <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold">
          Your listings
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Edit locations you manage. New listings stay in draft until reviewed.
        </p>

        {isAdminRole(session.user.role) && (
          <p className="mt-4 rounded-xl border border-border bg-surface-muted/50 px-4 py-3 text-sm text-ink-secondary">
            You have admin access.{" "}
            <Link href="/admin" className="font-medium text-brand hover:underline">
              Open admin CMS
            </Link>
          </p>
        )}

        <div className="mt-8 space-y-3">
          {places.map((place) => (
            <article
              key={place.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface-elevated p-5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold">
                    {place.name}
                  </h2>
                  {place.isDraft && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                      Draft
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {[place.type, place.address].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/manage/places/${place.id}/edit`}
                  className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:opacity-90"
                >
                  Edit
                </Link>
                {!place.isDraft && (
                  <Link
                    href={`/place/${place.id}`}
                    className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted"
                  >
                    View
                  </Link>
                )}
              </div>
            </article>
          ))}

          {places.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
              <p className="text-sm text-ink-secondary">You don&apos;t manage any locations yet.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link
                  href="/claim"
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
                >
                  Claim a listing
                </Link>
                <Link
                  href="/manage/places/new"
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink-secondary transition hover:bg-surface-muted"
                >
                  Add new location
                </Link>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
