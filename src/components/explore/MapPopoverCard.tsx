"use client";

import { ArrowRight, MapPin, Sparkle } from "@phosphor-icons/react";
import { placeProfilePath } from "@/lib/explore-routes";
import { placeLocationLabel } from "@/lib/place-location";
import { getPlaceDisplayPhotos } from "@/lib/place-photo";
import { traditionGradient } from "@/lib/places";
import type { PlaceMarker } from "@/types/place";

interface MapPopoverCardProps {
  place: PlaceMarker;
}

export function MapPopoverCard({ place }: MapPopoverCardProps) {
  const locationLabel = placeLocationLabel(place);
  const photos = getPlaceDisplayPhotos(place);
  // Plain anchor: cluster popups mount via createRoot outside the Next.js tree.
  const href = placeProfilePath(place);

  return (
    <div className="map-popover-card">
      <div
        className={`relative h-[72px] bg-gradient-to-br ${traditionGradient(place.tradition)}`}
      >
        {photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photos[0]}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
          <Sparkle size={10} weight="fill" />
          {place.type}
        </span>
      </div>

      <div className="space-y-2.5 p-3">
        <div>
          <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-ink">
            {place.name}
          </h3>
          <p className="mt-1 inline-flex items-start gap-1 text-[12px] text-ink-muted">
            <MapPin size={12} weight="bold" className="mt-0.5 shrink-0 text-brand" />
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
