import { LocationReviewsList } from "@/components/admin/LocationReviewsList";
import {
  getDeletedPlacesForReview,
  getDraftPlacesForReview,
} from "@/lib/data/places";
import { getPendingLocationSubmissions } from "@/lib/data/submissions";

export default async function AdminLocationReviewsPage() {
  const [drafts, suggestions, deleted] = await Promise.all([
    getDraftPlacesForReview(),
    getPendingLocationSubmissions(),
    getDeletedPlacesForReview(),
  ]);

  const total = drafts.length + suggestions.length;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Location reviews</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        All location intake in one place: owner-created drafts waiting to go live, plus public
        suggestions from the submit form. Soft-deleted listings stay here until restored or
        permanently removed.
      </p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
        {total} item{total === 1 ? "" : "s"} to review
        {deleted.length > 0
          ? ` · ${deleted.length} deleted`
          : ""}
      </p>

      <LocationReviewsList
        drafts={drafts}
        suggestions={suggestions}
        deleted={deleted}
      />
    </div>
  );
}
