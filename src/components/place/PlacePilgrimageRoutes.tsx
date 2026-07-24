"use client";

import Link from "next/link";
import { CaretRight, Path } from "@phosphor-icons/react";
import type { PlacePilgrimageRouteRef } from "@/lib/data/pilgrimage-routes";
import { traditionGradient } from "@/lib/places";

interface PlacePilgrimageRoutesProps {
  routes: PlacePilgrimageRouteRef[];
}

export function PlacePilgrimageRoutes({ routes }: PlacePilgrimageRoutesProps) {
  if (routes.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
            On these routes
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">
            Pilgrimage circuits that include this place.
          </p>
        </div>
        <Path size={20} weight="duotone" className="mb-0.5 shrink-0 text-brand" />
      </div>

      <ul className="mt-5 space-y-3">
        {routes.map((route) => (
          <li key={route.slug}>
            <Link
              href={`/pilgrimage/routes/${route.slug}`}
              className="group flex gap-3 rounded-2xl border border-border bg-surface-elevated p-2.5 transition-colors duration-200 hover:border-border-strong hover:bg-surface-muted sm:gap-4 sm:p-3"
            >
              <div
                className={`relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br sm:h-20 sm:w-20 ${traditionGradient(route.tradition)}`}
              >
                {route.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={route.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Path size={22} weight="bold" className="text-white/80" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
                      <Path size={12} weight="bold" className="shrink-0" />
                      {route.tradition}
                    </p>
                    <h3 className="mt-0.5 font-display text-base font-semibold tracking-tight text-ink">
                      {route.name}
                    </h3>
                  </div>
                  <CaretRight
                    size={16}
                    weight="bold"
                    className="mt-1 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-ink"
                  />
                </div>
                {route.blurb ? (
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-secondary">
                    {route.blurb}
                  </p>
                ) : null}
                <p className="mt-1.5 text-xs font-medium text-ink-muted">
                  {route.region}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
