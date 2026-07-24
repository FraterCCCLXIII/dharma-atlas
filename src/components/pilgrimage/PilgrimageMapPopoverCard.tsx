"use client";

import { ArrowRight, MapPin, Signpost } from "@phosphor-icons/react";
import {
  getPilgrimageImage,
  pilgrimageSitePath,
  type PilgrimageSite,
} from "@/data/pilgrimage";
import { traditionGradient } from "@/lib/places";

interface PilgrimageMapPopoverCardProps {
  site: PilgrimageSite;
  stopNumber?: number;
}

export function PilgrimageMapPopoverCard({
  site,
  stopNumber,
}: PilgrimageMapPopoverCardProps) {
  const href = pilgrimageSitePath(site.slug);
  const image = getPilgrimageImage(site.slug);
  const badge =
    site.templeNumber != null
      ? `Temple ${site.templeNumber}`
      : stopNumber != null
        ? `Stop ${stopNumber}`
        : site.tradition;
  const locationLabel = [site.country, site.region].filter(Boolean).join(" · ");

  return (
    <div className="map-popover-card">
      <div
        className={`relative h-[72px] bg-gradient-to-br ${traditionGradient(site.tradition)}`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
          <Signpost size={10} weight="fill" />
          {badge}
        </span>
      </div>

      <div className="space-y-2.5 p-3">
        <div>
          <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-ink">
            {site.name}
          </h3>
          <p className="mt-1 inline-flex items-start gap-1 text-[12px] text-ink-muted">
            <MapPin
              size={12}
              weight="bold"
              className="mt-0.5 shrink-0 text-brand"
            />
            <span className="line-clamp-2">{locationLabel}</span>
          </p>
        </div>

        <a
          href={href}
          className="map-popover-cta inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground transition hover:bg-brand-hover"
        >
          View details
          <ArrowRight size={12} weight="bold" />
        </a>
      </div>
    </div>
  );
}
