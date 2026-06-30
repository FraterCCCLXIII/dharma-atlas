"use client";

import Link from "next/link";
import type { Claim } from "@/lib/data/claims";
import { approveClaimAction, rejectClaimAction } from "@/app/admin/actions/claims";

const filters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

export function ClaimsAdminList({
  claims,
  currentStatus,
}: {
  claims: Claim[];
  currentStatus: string;
}) {
  return (
    <div className="mt-8">
      <div className="mb-6 flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin/claims" : `/admin/claims?status=${f.value}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              currentStatus === f.value
                ? "bg-brand text-brand-foreground"
                : "border border-border text-ink-secondary hover:bg-surface-muted"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        {claims.map((claim) => (
          <article
            key={claim.id}
            className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  claim · {claim.status}
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-fraunces)] text-xl font-semibold">
                  {claim.placeName}
                </h2>
                <p className="mt-1 text-sm text-ink-secondary">
                  From {claim.userName} ({claim.userEmail})
                </p>
              </div>
              <time className="text-xs text-ink-muted">
                {claim.createdAt.toLocaleDateString()}
              </time>
            </div>

            <dl className="mt-4 grid gap-2 text-sm">
              <div>
                <dt className="text-ink-muted">Role</dt>
                <dd>{claim.affiliationRole}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Message</dt>
                <dd className="whitespace-pre-wrap">{claim.message}</dd>
              </div>
              {claim.placeId && (
                <div>
                  <dt className="text-ink-muted">Listing</dt>
                  <dd>
                    <Link
                      href={`/place/${claim.placeId}`}
                      className="text-brand hover:underline"
                      target="_blank"
                    >
                      View place page
                    </Link>
                  </dd>
                </div>
              )}
            </dl>

            {claim.status === "pending" && claim.placeId && (
              <div className="mt-4 flex gap-2">
                <form action={approveClaimAction}>
                  <input type="hidden" name="id" value={claim.id} />
                  <button
                    type="submit"
                    className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:opacity-90"
                  >
                    Approve & grant access
                  </button>
                </form>
                <form action={rejectClaimAction}>
                  <input type="hidden" name="id" value={claim.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted"
                  >
                    Reject
                  </button>
                </form>
              </div>
            )}
          </article>
        ))}

        {claims.length === 0 && (
          <p className="text-sm text-ink-muted">No claims in this view.</p>
        )}
      </div>
    </div>
  );
}
