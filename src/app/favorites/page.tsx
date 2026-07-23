import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Path, Signpost } from "@phosphor-icons/react/dist/ssr";
import { PlaceCard } from "@/components/explore/PlaceCard";
import {
  getPilgrimageImage,
  pilgrimageRoutePath,
  pilgrimageSitePath,
} from "@/data/pilgrimage";
import { getSession } from "@/lib/auth-server";
import { getFavoritePlaces } from "@/lib/data/place-favorites";
import { getFavoritePilgrimageEntries } from "@/lib/data/pilgrimage-favorites";
import { listUserPilgrimageRoutes } from "@/lib/data/user-pilgrimage-routes";
import { SHOW_PILGRIMAGE } from "@/lib/feature-flags";
import { traditionGradient } from "@/lib/places";

export const metadata: Metadata = {
  title: "Favorites | Dharma Atlas",
  robots: { index: false, follow: false },
};

export default async function FavoritesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/favorites");
  }

  const [places, pilgrimage, myRoutes] = await Promise.all([
    getFavoritePlaces(session.user.id),
    SHOW_PILGRIMAGE
      ? getFavoritePilgrimageEntries(session.user.id)
      : Promise.resolve({ sites: [], routes: [] }),
    SHOW_PILGRIMAGE
      ? listUserPilgrimageRoutes(session.user.id)
      : Promise.resolve([]),
  ]);

  const hasPilgrimage =
    pilgrimage.sites.length > 0 ||
    pilgrimage.routes.length > 0 ||
    myRoutes.length > 0;
  const isEmpty = places.length === 0 && !hasPilgrimage;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Favorites</h1>
      <p className="mt-2 max-w-xl text-sm text-ink-muted">
        Places and pilgrimage routes you&apos;ve saved to come back to later.
      </p>

      {isEmpty ? (
        <div className="mt-12 max-w-md space-y-3">
          <p className="text-sm leading-relaxed text-ink-secondary">
            You haven&apos;t saved anything yet. Tap the heart on a listing or
            pilgrimage route to add it here.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/places"
              className="inline-flex text-sm font-medium text-brand hover:underline"
            >
              Browse places
            </Link>
            {SHOW_PILGRIMAGE ? (
              <Link
                href="/pilgrimage"
                className="inline-flex text-sm font-medium text-brand hover:underline"
              >
                Browse pilgrimage
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {places.length > 0 ? (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">
                Places
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {places.map((place, index) => (
                  <PlaceCard key={place.id} place={place} index={index} />
                ))}
              </div>
            </section>
          ) : null}

          {SHOW_PILGRIMAGE && pilgrimage.routes.length > 0 ? (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">
                Pilgrimage routes
              </h2>
              <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pilgrimage.routes.map((route) => {
                  const image = getPilgrimageImage(route.slug);
                  return (
                    <li key={route.slug}>
                      <Link
                        href={pilgrimageRoutePath(route.slug)}
                        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-[var(--shadow-card)] transition hover:border-border-strong"
                      >
                        <div
                          className={`relative aspect-[16/10] bg-gradient-to-br ${traditionGradient(route.tradition)}`}
                        >
                          {image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="flex flex-1 flex-col gap-1 px-4 py-4">
                          <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
                            <Path size={12} weight="bold" />
                            Route
                          </p>
                          <h3 className="font-display text-lg font-semibold text-ink">
                            {route.name}
                          </h3>
                          <p className="line-clamp-2 text-sm text-ink-secondary">
                            {route.summary}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {SHOW_PILGRIMAGE && pilgrimage.sites.length > 0 ? (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">
                Pilgrimage sites
              </h2>
              <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pilgrimage.sites.map((site) => {
                  const image = getPilgrimageImage(site.slug);
                  return (
                    <li key={site.slug}>
                      <Link
                        href={pilgrimageSitePath(site.slug)}
                        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-[var(--shadow-card)] transition hover:border-border-strong"
                      >
                        <div
                          className={`relative aspect-[16/10] bg-gradient-to-br ${traditionGradient(site.tradition)}`}
                        >
                          {image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="flex flex-1 flex-col gap-1 px-4 py-4">
                          <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
                            <Signpost size={12} weight="bold" />
                            Site
                          </p>
                          <h3 className="font-display text-lg font-semibold text-ink">
                            {site.name}
                          </h3>
                          <p className="line-clamp-2 text-sm text-ink-secondary">
                            {site.summary}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {SHOW_PILGRIMAGE && myRoutes.length > 0 ? (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">
                My custom routes
              </h2>
              <ul className="mt-6 space-y-2">
                {myRoutes.map((route) => (
                  <li key={route.id}>
                    <Link
                      href={`/pilgrimage/my/${route.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-elevated px-4 py-3 transition hover:bg-surface-muted"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-ink">
                          {route.title}
                        </span>
                        <span className="text-xs text-ink-muted">
                          {route.stopSlugs.length} stops
                          {route.baseRouteSlug
                            ? ` · based on ${route.baseRouteSlug}`
                            : ""}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-brand">
                        Open →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
