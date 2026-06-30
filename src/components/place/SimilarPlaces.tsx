"use client";

import Link from "next/link";
import { MapPin } from "@phosphor-icons/react";
import {
  cardContentClassName,
  cardImageFrameClassName,
  cardImagePaddingClassName,
  cardLiftClassName,
} from "@/lib/card-styles";
import { getPlaceDisplayPhotos } from "@/lib/place-photo";
import { traditionGradient } from "@/lib/places";
import type { Place } from "@/types/place";

interface SimilarPlacesProps {
  places: Place[];
}

export function SimilarPlaces({ places }: SimilarPlacesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">
          Similar places nearby
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Other centers and temples in the same tradition.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {places.map((place) => {
          const photos = getPlaceDisplayPhotos(place);

          return (
            <Link
              key={place.id}
              href={`/place/${place.id}`}
              className={`group rounded-2xl ${cardLiftClassName}`}
            >
              <div className={cardImagePaddingClassName}>
                <div
                  className={`relative h-32 bg-gradient-to-br ${cardImageFrameClassName} ${traditionGradient(place.tradition)}`}
                >
                  {photos.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photos[0]}
                      alt=""
                      className="absolute inset-0 h-full w-full rounded-xl object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
                    {place.type}
                  </span>
                </div>
              </div>
              <div className={cardContentClassName}>
                <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-ink">
                  {place.name}
                </h3>
                <p className="inline-flex items-center gap-1 text-xs text-ink-muted">
                  <MapPin size={12} weight="bold" className="shrink-0" />
                  <span className="line-clamp-1">
                    {place.address?.trim() ||
                      `${place.lat.toFixed(2)}, ${place.lng.toFixed(2)}`}
                  </span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
