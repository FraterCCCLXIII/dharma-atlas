"use client";

import { Broadcast, MapPin, Sparkle } from "@phosphor-icons/react";
import { motion } from "motion/react";
import {
  cardImageFrameClassName,
  cardImagePaddingClassName,
  cardLiftClassName,
} from "@/lib/card-styles";
import { PlaceFavoriteButton } from "@/components/place/PlaceFavoriteButton";
import { getPlaceDisplayPhotos } from "@/lib/place-photo";
import { isValidCoord } from "@/lib/coords";
import {
  parseLocationMode,
  placeLocationLabel,
  placeShowsMapPin,
} from "@/lib/place-location";
import { placeProfilePath } from "@/lib/explore-routes";
import { traditionGradient } from "@/lib/places";
import { getPlaceDisplayTags } from "@/lib/schools";
import { useExploreStore } from "@/store/explore-store";
import type { PlaceMarker } from "@/types/place";

interface PlaceCardProps {
  place: PlaceMarker;
  index: number;
  showKindBadge?: boolean;
  /** Off for virtualized lists — remount animations fight absolute row positioning. */
  animateEntrance?: boolean;
}

export function PlaceCard({
  place,
  index,
  showKindBadge,
  animateEntrance = true,
}: PlaceCardProps) {
  const isHovered = useExploreStore((s) => s.hoveredId === place.id);
  const setHoveredId = useExploreStore((s) => s.setHoveredId);

  const displayTags = getPlaceDisplayTags(place).filter((tag) => tag.kind !== "type");
  const photos = getPlaceDisplayPhotos(place);
  const locationMode = parseLocationMode(place.locationMode);
  const locationLabel = placeLocationLabel(place);
  const LocationIcon = locationMode === "online" ? Broadcast : MapPin;

  return (
    <motion.article
      className="relative"
      initial={animateEntrance ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={
        animateEntrance
          ? { duration: 0.25, delay: Math.min(index * 0.02, 0.2) }
          : { duration: 0 }
      }
      onMouseEnter={() => {
        if (placeShowsMapPin(place) && isValidCoord(place.lat, place.lng)) {
          setHoveredId(place.id);
        }
      }}
      onMouseLeave={() => setHoveredId(null)}
    >
      {/* Full document nav — soft-nav stalls while Leaflet unmounts thousands of markers. */}
      <a
        href={placeProfilePath(place)}
        className={`group block rounded-2xl text-left ${cardLiftClassName} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
          isHovered ? "bg-surface-muted" : ""
        }`}
      >
        <div className={cardImagePaddingClassName}>
          <div
            className={`relative flex h-36 items-end bg-gradient-to-br ${cardImageFrameClassName} ${traditionGradient(place.tradition)}`}
          >
            {photos.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photos[0]}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full rounded-xl object-cover"
              />
            ) : null}
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <span className="relative m-3 inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-[12px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
              <Sparkle size={12} weight="fill" />
              {showKindBadge ? "Location" : place.type}
            </span>
          </div>
        </div>

        <div className="px-4 pb-4 pt-1">
          <div className="space-y-1">
            <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink">
              {place.name}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
              <LocationIcon size={14} weight="bold" className="shrink-0" />
              <span className="line-clamp-1">{locationLabel}</span>
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
            {displayTags.map((tag) => (
              <span
                key={tag.key}
                className="rounded-md bg-surface-muted px-2 py-0.5 font-medium"
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </a>

      {/* Sibling overlay so the heart doesn't trigger card navigation. */}
      <div className="absolute right-5 top-5 z-10">
        <PlaceFavoriteButton placeId={place.id} variant="overlay" />
      </div>
    </motion.article>
  );
}
