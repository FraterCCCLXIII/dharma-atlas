"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Path, PencilSimple } from "@phosphor-icons/react";
import type { PilgrimageRoute } from "@/data/pilgrimage";
import { PILGRIMAGE_LIST_PATH } from "@/lib/explore-routes";
import type { RouteStopPoint } from "@/lib/pilgrimage-stop-ref";
import { PilgrimageLegTravel } from "./PilgrimageLegTravel";
import { PilgrimageRouteMap } from "./PilgrimageRouteMap";
import { PilgrimageShareButton } from "./PilgrimageShareButton";

export function UserPilgrimageRouteLayout({
  routeId,
  title,
  notes,
  shareId,
  isOwner,
  baseRoute,
  mapRoute,
  stops,
}: {
  routeId: string;
  title: string;
  notes: string | null;
  shareId: string;
  isOwner: boolean;
  baseRoute: { slug: string; name: string } | null;
  mapRoute: PilgrimageRoute;
  stops: RouteStopPoint[];
}) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const sharePath = `/pilgrimage/r/${shareId}`;

  return (
    <div className="lg:flex lg:items-start">
      <div className="min-w-0 px-4 pb-20 pt-8 sm:px-6 lg:w-1/2 lg:px-8 xl:pl-12">
        <div className="mx-auto w-full max-w-2xl space-y-10 lg:mx-0 lg:max-w-none">
          <Link
            href={isOwner ? "/favorites" : PILGRIMAGE_LIST_PATH}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary transition hover:text-ink"
          >
            <ArrowLeft size={14} weight="bold" />
            {isOwner ? "Favorites" : "Pilgrimage"}
          </Link>

          <header className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
              <Path size={14} weight="bold" />
              {isOwner ? "Your route" : "Shared route"}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {title}
            </h1>
            {baseRoute ? (
              <p className="mt-2 text-sm text-ink-secondary">
                Based on{" "}
                <Link
                  href={`/pilgrimage/routes/${baseRoute.slug}`}
                  className="font-medium text-brand hover:underline"
                >
                  {baseRoute.name}
                </Link>
              </p>
            ) : null}
            {notes ? (
              <p className="mt-3 text-base leading-relaxed text-ink-secondary">
                {notes}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <PilgrimageShareButton
                title={title}
                text={`Pilgrimage route with ${stops.length} stops`}
                url={sharePath}
              />
              {isOwner ? (
                <Link
                  href={`/pilgrimage/my/${routeId}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink"
                >
                  <PencilSimple size={14} weight="bold" />
                  Edit route
                </Link>
              ) : null}
            </div>
          </header>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
              Stops
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">
              {stops.length} stops on this itinerary
            </p>
            <ol className="mt-4 space-y-3">
              {stops.map((stop, index) => {
                const prev = index > 0 ? stops[index - 1] : null;
                const isHovered = hoveredSlug === stop.key;
                const body = (
                  <>
                    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                      {stop.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={stop.image}
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
                        {stop.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-muted">
                        {stop.detail}
                      </span>
                    </span>
                  </>
                );
                const className = `flex gap-3 rounded-xl border bg-surface-elevated p-3 transition hover:bg-surface-muted ${
                  isHovered
                    ? "border-accent ring-2 ring-brand/20"
                    : "border-border"
                }`;

                return (
                  <li key={stop.key} className="space-y-2">
                    {prev ? (
                      <PilgrimageLegTravel
                        from={{
                          name: prev.name,
                          lat: prev.lat,
                          lng: prev.lng,
                        }}
                        to={{
                          name: stop.name,
                          lat: stop.lat,
                          lng: stop.lng,
                        }}
                      />
                    ) : null}
                    {stop.href ? (
                      <Link
                        href={stop.href}
                        onMouseEnter={() => setHoveredSlug(stop.key)}
                        onMouseLeave={() => setHoveredSlug(null)}
                        onFocus={() => setHoveredSlug(stop.key)}
                        onBlur={() => setHoveredSlug(null)}
                        className={className}
                      >
                        {body}
                      </Link>
                    ) : (
                      <div
                        onMouseEnter={() => setHoveredSlug(stop.key)}
                        onMouseLeave={() => setHoveredSlug(null)}
                        className={className}
                      >
                        {body}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>

      <aside className="relative z-0 mt-8 min-h-0 p-3 sm:p-4 lg:sticky lg:top-0 lg:mt-0 lg:h-[calc(100dvh-var(--site-header-height,4.5rem))] lg:w-1/2 lg:shrink-0 lg:self-start lg:p-5">
        <PilgrimageRouteMap
          route={mapRoute}
          resolvedStops={stops}
          hoveredSlug={hoveredSlug}
          className="relative h-[360px] lg:h-full"
        />
      </aside>
    </div>
  );
}
