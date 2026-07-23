import Link from "next/link";
import { ArrowLeft, Path } from "@phosphor-icons/react/dist/ssr";
import {
  getPilgrimageImage,
  getPilgrimageRoute,
  getPilgrimageSite,
  pilgrimageRoutePath,
  pilgrimageSitePath,
} from "@/data/pilgrimage";
import { PILGRIMAGE_LIST_PATH } from "@/lib/explore-routes";
import type { UserPilgrimageRouteRow } from "@/db/schema";
import { PilgrimageLegTravel } from "./PilgrimageLegTravel";
import { PilgrimageShareButton } from "./PilgrimageShareButton";

export function UserPilgrimageRouteView({
  route,
  isOwner = false,
}: {
  route: UserPilgrimageRouteRow;
  isOwner?: boolean;
}) {
  const base = route.baseRouteSlug
    ? getPilgrimageRoute(route.baseRouteSlug)
    : undefined;
  const stopSites = route.stopSlugs
    .map((slug) => getPilgrimageSite(slug))
    .filter((site): site is NonNullable<typeof site> => site != null);
  const sharePath = `/pilgrimage/r/${route.shareId}`;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <Link
        href={isOwner ? "/favorites" : PILGRIMAGE_LIST_PATH}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary transition hover:text-ink"
      >
        <ArrowLeft size={14} weight="bold" />
        {isOwner ? "Favorites" : "Pilgrimage"}
      </Link>

      <header className="mt-6">
        <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
          <Path size={14} weight="bold" />
          {isOwner ? "Your route" : "Shared route"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {route.title}
        </h1>
        {base ? (
          <p className="mt-2 text-sm text-ink-secondary">
            Based on{" "}
            <Link
              href={pilgrimageRoutePath(base.slug)}
              className="font-medium text-brand hover:underline"
            >
              {base.name}
            </Link>
          </p>
        ) : null}
        {route.notes ? (
          <p className="mt-3 text-base leading-relaxed text-ink-secondary">
            {route.notes}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <PilgrimageShareButton
            title={route.title}
            text={`Pilgrimage route with ${stopSites.length} stops`}
            url={sharePath}
          />
          {isOwner && base ? (
            <Link
              href={`${pilgrimageRoutePath(base.slug)}/customize`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink"
            >
              Edit again from base
            </Link>
          ) : null}
        </div>
      </header>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          Stops
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          {stopSites.length} sites on this itinerary
        </p>
        <ol className="mt-4 space-y-3">
          {stopSites.map((site, index) => {
            const image = getPilgrimageImage(site.slug);
            return (
              <li key={site.slug} className="space-y-2">
                {index > 0 && stopSites[index - 1] ? (
                  <PilgrimageLegTravel
                    from={stopSites[index - 1]!}
                    to={site}
                  />
                ) : null}
                <Link
                  href={pilgrimageSitePath(site.slug)}
                  className="flex gap-3 rounded-xl border border-border bg-surface-elevated p-3 transition hover:bg-surface-muted"
                >
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                    <span className="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
                      {index + 1}
                    </span>
                  </span>
                  <span className="min-w-0 py-0.5">
                    <span className="block text-sm font-semibold text-ink">
                      {site.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-muted">
                      {site.country}
                    </span>
                    <span className="mt-1 block line-clamp-2 text-sm leading-relaxed text-ink-secondary">
                      {site.summary}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
