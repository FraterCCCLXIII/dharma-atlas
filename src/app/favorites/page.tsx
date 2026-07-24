import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Heart,
  MapPin,
  Path,
  Signpost,
} from "@phosphor-icons/react/dist/ssr";
import { PlaceCard } from "@/components/explore/PlaceCard";
import { FavoritesPilgrimageCard } from "@/components/favorites/FavoritesPilgrimageCard";
import { FavoritesUserRouteCard } from "@/components/favorites/FavoritesUserRouteCard";
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

  const sections = [
    SHOW_PILGRIMAGE && myRoutes.length > 0
      ? {
          id: "my-routes",
          label: "My itineraries",
          count: myRoutes.length,
        }
      : null,
    places.length > 0
      ? { id: "places", label: "Places", count: places.length }
      : null,
    SHOW_PILGRIMAGE && pilgrimage.routes.length > 0
      ? {
          id: "routes",
          label: "Routes",
          count: pilgrimage.routes.length,
        }
      : null,
    SHOW_PILGRIMAGE && pilgrimage.sites.length > 0
      ? {
          id: "sites",
          label: "Sites",
          count: pilgrimage.sites.length,
        }
      : null,
  ].filter((section): section is { id: string; label: string; count: number } =>
    Boolean(section),
  );

  const totalSaved =
    places.length +
    pilgrimage.sites.length +
    pilgrimage.routes.length +
    myRoutes.length;
  const isEmpty = totalSaved === 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
          Your library
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Favorites
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          {isEmpty
            ? "Places, pilgrimage routes, and itineraries you save show up here."
            : `${totalSaved} saved ${totalSaved === 1 ? "item" : "items"} — jump back in anytime.`}
        </p>
      </header>

      {isEmpty ? (
        <EmptyFavorites />
      ) : (
        <>
          {sections.length > 1 ? (
            <nav
              aria-label="Favorites sections"
              className="mt-8 flex flex-wrap gap-2 border-b border-border pb-4"
            >
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink"
                >
                  {section.label}
                  <span className="tabular-nums text-ink-muted">
                    {section.count}
                  </span>
                </a>
              ))}
            </nav>
          ) : null}

          <div className="mt-10 space-y-14">
            {SHOW_PILGRIMAGE && myRoutes.length > 0 ? (
              <section id="my-routes" className="scroll-mt-28">
                <SectionHeader
                  title="My itineraries"
                  count={myRoutes.length}
                  description="Custom routes you’ve forked and edited."
                  action={{ href: "/pilgrimage", label: "Browse routes" }}
                />
                <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                  {myRoutes.map((route) => (
                    <FavoritesUserRouteCard key={route.id} route={route} />
                  ))}
                </div>
              </section>
            ) : null}

            {places.length > 0 ? (
              <section id="places" className="scroll-mt-28">
                <SectionHeader
                  title="Places"
                  count={places.length}
                  description="Centers and sacred sites you’ve hearted."
                  action={{ href: "/places", label: "Browse places" }}
                />
                <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                  {places.map((place, index) => (
                    <PlaceCard key={place.id} place={place} index={index} />
                  ))}
                </div>
              </section>
            ) : null}

            {SHOW_PILGRIMAGE && pilgrimage.routes.length > 0 ? (
              <section id="routes" className="scroll-mt-28">
                <SectionHeader
                  title="Pilgrimage routes"
                  count={pilgrimage.routes.length}
                  description="Canonical circuits you’ve saved."
                  action={{ href: "/pilgrimage", label: "Browse pilgrimage" }}
                />
                <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pilgrimage.routes.map((route) => {
                    const stopCount =
                      route.stopSlugs.length + (route.extraStops?.length ?? 0);
                    return (
                      <FavoritesPilgrimageCard
                        key={route.slug}
                        kind="route"
                        href={pilgrimageRoutePath(route.slug)}
                        slug={route.slug}
                        name={route.name}
                        summary={route.summary}
                        meta={`${route.region} · ${stopCount} stops`}
                        image={getPilgrimageImage(route.slug)}
                        tradition={route.tradition}
                      />
                    );
                  })}
                </div>
              </section>
            ) : null}

            {SHOW_PILGRIMAGE && pilgrimage.sites.length > 0 ? (
              <section id="sites" className="scroll-mt-28">
                <SectionHeader
                  title="Pilgrimage sites"
                  count={pilgrimage.sites.length}
                  description="Individual temples and landmarks on your list."
                  action={{ href: "/pilgrimage", label: "Browse pilgrimage" }}
                />
                <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pilgrimage.sites.map((site) => (
                    <FavoritesPilgrimageCard
                      key={site.slug}
                      kind="site"
                      href={pilgrimageSitePath(site.slug)}
                      slug={site.slug}
                      name={site.name}
                      summary={site.summary}
                      meta={`${site.country} · ${site.region}`}
                      image={getPilgrimageImage(site.slug)}
                      tradition={site.tradition}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  count,
  description,
  action,
}: {
  title: string;
  count: number;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {title}
          <span className="ml-2 text-base font-medium tabular-nums text-ink-muted">
            {count}
          </span>
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">{description}</p>
      </div>
      {action ? (
        <Link
          href={action.href}
          className="text-sm font-medium text-brand hover:underline"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

function EmptyFavorites() {
  return (
    <div className="mt-12 rounded-3xl border border-border bg-surface-elevated px-6 py-12 sm:px-10">
      <div className="mx-auto flex max-w-lg flex-col items-start">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-brand">
          <Heart size={22} weight="fill" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">
          Nothing saved yet
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Tap the heart on a place or pilgrimage route to keep it here. You can
          also fork a route into a custom itinerary.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/places"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
          >
            <MapPin size={15} weight="bold" />
            Browse places
          </Link>
          {SHOW_PILGRIMAGE ? (
            <Link
              href="/pilgrimage"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink"
            >
              <Path size={15} weight="bold" />
              Browse pilgrimage
            </Link>
          ) : null}
        </div>
        {SHOW_PILGRIMAGE ? (
          <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <Signpost size={13} weight="bold" />
            Tip: open any route and choose Customize to start an itinerary.
          </p>
        ) : null}
      </div>
    </div>
  );
}
