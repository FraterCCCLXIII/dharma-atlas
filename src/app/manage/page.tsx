import type { Metadata } from "next";
import Link from "next/link";
import { PlaceProfileOnboarding } from "@/components/manage/PlaceProfileOnboarding";
import { getPlacesForUser } from "@/lib/data/memberships";
import { getClaimsForUser } from "@/lib/data/claims";
import { getPlaceEvents } from "@/lib/data/place-events";
import { getPlaceSocials } from "@/lib/data/place-socials";
import { getPlaceTeachers } from "@/lib/data/place-teachers";
import { attachPhotosToPlace } from "@/lib/data/place-photos";
import { getSubmissionsForEmail } from "@/lib/data/submissions";
import { getSession } from "@/lib/auth-server";
import { placeProfilePath } from "@/lib/explore-routes";
import { getPlaceOnboardingStatus } from "@/lib/manage-place-onboarding";
import { isAdminRole } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Place Listings | Dharma Atlas",
  robots: { index: false, follow: false },
};

function PlaceStatusBadge({
  isDraft,
  publishRequestedAt,
}: {
  isDraft?: boolean;
  publishRequestedAt?: string;
}) {
  if (!isDraft) {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
        Published
      </span>
    );
  }
  if (publishRequestedAt) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
        Publish requested
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
      Draft
    </span>
  );
}

export default async function ManageDashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const places = await getPlacesForUser(session.user.id);
  const managedPlaceIds = new Set(places.map((place) => place.id));
  const [userClaims, userSubmissions, placesWithPhotos] = await Promise.all([
    getClaimsForUser(session.user.id),
    getSubmissionsForEmail(session.user.email),
    Promise.all(places.map((place) => attachPhotosToPlace(place))),
  ]);

  const onboardingStatuses = await Promise.all(
    placesWithPhotos.map(async (place) => {
      const [teachers, listings, socials] = await Promise.all([
        getPlaceTeachers(place.id),
        getPlaceEvents(place.id),
        getPlaceSocials(place.id),
      ]);
      return getPlaceOnboardingStatus(place, {
        teacherCount: teachers.length,
        listingCount: listings.length,
        socialCount: socials.length,
      });
    }),
  );
  const incompleteOnboarding = onboardingStatuses.filter((status) => !status.isComplete);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Place Listings</h1>
      <p className="mt-2 max-w-xl text-sm text-ink-muted">
        Claim a listing already in the directory, or add a new one. New locations stay in draft
        until our team publishes them. After a claim is approved, you can edit content, tags, and
        hours here.
      </p>

      {isAdminRole(session.user.role) && (
        <p className="mt-4 rounded-xl border border-border bg-surface-muted/50 px-4 py-3 text-sm text-ink-secondary">
          You have admin access.{" "}
          <Link href="/admin" className="font-medium text-brand hover:underline">
            Open admin CMS
          </Link>
        </p>
      )}

      {incompleteOnboarding.length > 0 ? (
        <section className="mt-6 space-y-3">
          {incompleteOnboarding.map((status) => (
            <PlaceProfileOnboarding
              key={status.placeId}
              status={status}
              variant="dashboard"
            />
          ))}
        </section>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/add"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
        >
          Add new location
        </Link>
        <Link
          href="/manage/claim"
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink-secondary transition hover:bg-surface-muted"
        >
          Claim existing listing
        </Link>
      </div>

      {(userClaims.length > 0 || userSubmissions.length > 0) && (
        <section className="mt-10 space-y-6">
          {userClaims.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold">Your claims</h2>
              <ul className="mt-3 space-y-2">
                {userClaims.map((claim) => {
                  const canEdit =
                    claim.status === "approved" &&
                    claim.placeId &&
                    managedPlaceIds.has(claim.placeId);

                  return (
                    <li
                      key={claim.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm"
                    >
                      <div>
                        <span className="font-medium">{claim.placeName}</span>
                        <span className="ml-2 capitalize text-ink-muted">{claim.status}</span>
                        {claim.placeId && (
                          <span className="mt-1 block text-xs text-ink-muted">
                            <Link
                              href={`/place/${claim.placeId}`}
                              className="text-brand hover:underline"
                            >
                              View listing
                            </Link>
                          </span>
                        )}
                      </div>
                      {canEdit && claim.placeId && (
                        <Link
                          href={`/manage/places/${claim.placeId}/edit/details`}
                          className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground transition hover:opacity-90"
                        >
                          Edit
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {userSubmissions.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold">Your suggestions</h2>
              <p className="mt-1 text-xs text-ink-muted">
                Anonymous directory suggestions — separate from locations you manage.
              </p>
              <ul className="mt-3 space-y-2">
                {userSubmissions.map((submission) => (
                  <li
                    key={submission.id}
                    className="rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm"
                  >
                    <span className="font-medium">{submission.name}</span>
                    <span className="ml-2 capitalize text-ink-muted">{submission.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Managed locations</h2>
        <div className="mt-3 space-y-3">
          {places.map((place) => (
            <article
              key={place.id}
              className="group relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface-elevated p-5 transition hover:border-brand/30 hover:bg-surface-muted/30"
            >
              <Link
                href={`/manage/places/${place.id}/edit/details`}
                className="absolute inset-0 z-0 rounded-2xl"
                aria-label={`Manage ${place.name}`}
              />
              <div className="relative z-10 pointer-events-none">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl font-semibold">{place.name}</h3>
                  <PlaceStatusBadge
                    isDraft={place.isDraft}
                    publishRequestedAt={place.publishRequestedAt}
                  />
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {[place.type, place.address].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="relative z-10 flex gap-2 pointer-events-none">
                <span className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition group-hover:opacity-90">
                  Manage
                </span>
                {!place.isDraft && (
                  <Link
                    href={placeProfilePath(place)}
                    className="pointer-events-auto rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted"
                  >
                    View
                  </Link>
                )}
              </div>
            </article>
          ))}

          {places.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
              <p className="text-sm font-medium text-ink">No managed locations yet</p>
              <p className="mt-2 text-sm text-ink-secondary">
                Already listed? Claim it and we&apos;ll verify your affiliation. Not listed? Add a
                draft and request publish when ready.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href="/manage/claim"
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
                >
                  Claim a listing
                </Link>
                <Link
                  href="/add"
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink-secondary transition hover:bg-surface-muted"
                >
                  Add new location
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
