"use client";

import { useEffect, useState } from "react";
import { ArrowRight, MapPin, Sparkle } from "@phosphor-icons/react";
import { placeProfilePath } from "@/lib/explore-routes";
import { fetchExplorePlaceCard } from "@/lib/explore-place-card-client";
import { placeLocationLabel } from "@/lib/place-location";
import { getPlaceDisplayPhotos } from "@/lib/place-photo";
import { traditionGradient } from "@/lib/places";
import type { ExploreMapPin, PlaceMarker } from "@/types/place";

interface MapPopoverCardProps {
  place: PlaceMarker | ExploreMapPin;
}

function isPlaceMarker(
  place: PlaceMarker | ExploreMapPin,
): place is PlaceMarker {
  return "name" in place && typeof place.name === "string";
}

export function MapPopoverCard({ place }: MapPopoverCardProps) {
  const [card, setCard] = useState<PlaceMarker | null>(() =>
    isPlaceMarker(place) ? place : null,
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isPlaceMarker(place)) {
      setCard(place);
      setError(false);
      return;
    }

    let cancelled = false;
    setCard(null);
    setError(false);

    fetchExplorePlaceCard(place.id)
      .then((next) => {
        if (cancelled) return;
        if (!next) {
          setError(true);
          return;
        }
        setCard(next);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [place.id, place]);

  if (!card) {
    return (
      <div className="map-popover-card">
        <div
          className={`relative h-[72px] bg-gradient-to-br ${traditionGradient(place.tradition)}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_55%)]" />
        </div>
        <div className="space-y-2.5 p-3">
          <p className="text-sm text-ink-muted">
            {error ? "Couldn’t load place" : "Loading…"}
          </p>
          <a
            href={placeProfilePath(place)}
            className="map-popover-cta inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground transition hover:bg-brand-hover"
          >
            View details
            <ArrowRight size={12} weight="bold" />
          </a>
        </div>
      </div>
    );
  }

  const locationLabel = placeLocationLabel(card);
  const photos = getPlaceDisplayPhotos(card);
  // Plain anchor: cluster popups mount via createRoot outside the Next.js tree.
  const href = placeProfilePath(card);

  return (
    <div className="map-popover-card">
      <div
        className={`relative h-[72px] bg-gradient-to-br ${traditionGradient(card.tradition)}`}
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
          {card.type}
        </span>
      </div>

      <div className="space-y-2.5 p-3">
        <div>
          <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-ink">
            {card.name}
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
