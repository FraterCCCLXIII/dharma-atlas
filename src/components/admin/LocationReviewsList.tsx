import Link from "next/link";
import {
  publishDraftPlaceAction,
  restorePlaceAction,
} from "@/app/admin/actions/places";
import {
  approveSubmissionAction,
  rejectSubmissionAction,
} from "@/app/admin/actions/submissions";
import { PermanentDeleteForm } from "@/components/admin/PermanentDeleteForm";
import type { DraftPlaceReview } from "@/lib/data/places";
import type { Submission } from "@/lib/data/submissions";

export function LocationReviewsList({
  drafts,
  suggestions,
  deleted,
}: {
  drafts: DraftPlaceReview[];
  suggestions: Submission[];
  deleted: DraftPlaceReview[];
}) {
  return (
    <div className="mt-8 space-y-10">
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-semibold">Owner drafts</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Locations created from Manage. Publish when ready for the public directory.
            </p>
          </div>
          <p className="text-xs font-semibold text-ink-muted">{drafts.length} draft{drafts.length === 1 ? "" : "s"}</p>
        </div>

        {drafts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-sm text-ink-muted">
            No draft locations right now.
          </p>
        ) : (
          <ul className="space-y-3">
            {drafts.map((place) => (
              <li
                key={place.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-surface-elevated p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{place.name}</h3>
                    {place.publishRequestedAt ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                        Publish requested
                      </span>
                    ) : (
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {[place.type, place.tradition, place.address].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {place.ownerEmail
                      ? `Managed by ${place.ownerName ?? place.ownerEmail} (${place.ownerEmail})`
                      : "No owner membership"}
                    {place.dataSource ? ` · ${place.dataSource}` : ""}
                    {` · created ${new Date(place.createdAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/places/${place.id}/edit`}
                    className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted"
                  >
                    Review
                  </Link>
                  <form action={publishDraftPlaceAction}>
                    <input type="hidden" name="id" value={place.id} />
                    <button
                      type="submit"
                      className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:opacity-90"
                    >
                      Publish
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-semibold">Public suggestions</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Location tips from `/submit` that still need approval.
            </p>
          </div>
          <p className="text-xs font-semibold text-ink-muted">
            {suggestions.length} pending
          </p>
        </div>

        {suggestions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-sm text-ink-muted">
            No pending location suggestions.
          </p>
        ) : (
          <ul className="space-y-3">
            {suggestions.map((submission) => (
              <li
                key={submission.id}
                className="rounded-2xl border border-border bg-surface-elevated p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                      suggestion · pending
                    </p>
                    <h3 className="mt-1 font-display text-lg font-semibold">{submission.name}</h3>
                    <p className="mt-1 text-sm text-ink-secondary">
                      From {submission.submitterName} ({submission.submitterEmail})
                    </p>
                    {submission.location && (
                      <p className="mt-1 text-sm text-ink-muted">{submission.location}</p>
                    )}
                  </div>
                  <time className="text-xs text-ink-muted">
                    {submission.createdAt.toLocaleDateString()}
                  </time>
                </div>
                {submission.notes && (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-ink-secondary">
                    {submission.notes}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={approveSubmissionAction}>
                    <input type="hidden" name="id" value={submission.id} />
                    <button
                      type="submit"
                      className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:opacity-90"
                    >
                      Approve & create draft
                    </button>
                  </form>
                  <form action={rejectSubmissionAction}>
                    <input type="hidden" name="id" value={submission.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted"
                    >
                      Reject
                    </button>
                  </form>
                  <Link
                    href="/admin/submissions?status=pending"
                    className="inline-flex items-center rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted"
                  >
                    Open in Submissions
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-semibold">Deleted listings</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Soft-deleted by owners or admins. Restore to bring them back, or permanently
              delete to remove them from the database.
            </p>
          </div>
          <p className="text-xs font-semibold text-ink-muted">
            {deleted.length} deleted
          </p>
        </div>

        {deleted.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-sm text-ink-muted">
            No deleted listings.
          </p>
        ) : (
          <ul className="space-y-3">
            {deleted.map((place) => (
              <li
                key={place.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50/40 p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{place.name}</h3>
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-800">
                      Deleted
                    </span>
                    {place.isDraft ? (
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                        Was draft
                      </span>
                    ) : (
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                        Was published
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {[place.type, place.tradition, place.address].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {place.ownerEmail
                      ? `Managed by ${place.ownerName ?? place.ownerEmail} (${place.ownerEmail})`
                      : "No owner membership"}
                    {place.deletedAt
                      ? ` · deleted ${new Date(place.deletedAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/places/${place.id}/edit`}
                    className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted"
                  >
                    View
                  </Link>
                  <form action={restorePlaceAction}>
                    <input type="hidden" name="id" value={place.id} />
                    <button
                      type="submit"
                      className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:opacity-90"
                    >
                      Restore
                    </button>
                  </form>
                  <PermanentDeleteForm placeId={place.id} placeName={place.name} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
