"use client";

import Link from "next/link";
import type { Submission } from "@/lib/data/submissions";
import {
  approveSubmissionAction,
  rejectSubmissionAction,
} from "@/app/admin/actions/submissions";

const filters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

export function SubmissionsAdminList({
  submissions,
  currentStatus,
}: {
  submissions: Submission[];
  currentStatus: string;
}) {
  return (
    <div className="mt-8">
      <div className="mb-6 flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin/submissions" : `/admin/submissions?status=${f.value}`}
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
        {submissions.map((s) => (
          <article
            key={s.id}
            className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  {s.entryType} · {s.status}
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold">
                  {s.name}
                </h2>
                <p className="mt-1 text-sm text-ink-secondary">
                  From {s.submitterName} ({s.submitterEmail})
                </p>
              </div>
              <time className="text-xs text-ink-muted">
                {s.createdAt.toLocaleDateString()}
              </time>
            </div>

            <dl className="mt-4 grid gap-2 text-sm">
              {s.location && (
                <div>
                  <dt className="text-ink-muted">Location</dt>
                  <dd>{s.location}</dd>
                </div>
              )}
              {s.website && (
                <div>
                  <dt className="text-ink-muted">Website</dt>
                  <dd>
                    <a href={s.website} className="text-brand hover:underline" target="_blank" rel="noreferrer">
                      {s.website}
                    </a>
                  </dd>
                </div>
              )}
              {s.notes && (
                <div>
                  <dt className="text-ink-muted">Notes</dt>
                  <dd className="whitespace-pre-wrap">{s.notes}</dd>
                </div>
              )}
            </dl>

            {s.status === "pending" && (
              <div className="mt-4 flex gap-2">
                <form action={approveSubmissionAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    type="submit"
                    className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:bg-brand-hover"
                  >
                    Approve & edit
                  </button>
                </form>
                <form action={rejectSubmissionAction}>
                  <input type="hidden" name="id" value={s.id} />
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
      </div>

      {submissions.length === 0 && (
        <p className="py-12 text-center text-sm text-ink-muted">No submissions in this view.</p>
      )}
    </div>
  );
}
