"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Broadcast,
  Check,
  Compass,
  CopySimple,
  MapPin,
} from "@phosphor-icons/react";
import { parseLocationMode, placeLocationLabel } from "@/lib/place-location";
import type { Place } from "@/types/place";

interface PlaceAddressActionsProps {
  copyText?: string | null;
  directionsUrl?: string | null;
}

export function PlaceAddressActions({
  copyText = null,
  directionsUrl = null,
}: PlaceAddressActionsProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
    } catch {
      // Clipboard can fail in insecure contexts; leave UI unchanged.
    }
  }

  if (!copyText && !directionsUrl) return null;

  return (
    <span className="ml-1.5 inline-flex items-center gap-1 align-middle">
      {copyText ? (
        <button
          type="button"
          onClick={() => void handleCopy()}
          aria-label={copied ? "Address copied" : "Copy address"}
          title={copied ? "Copied" : "Copy address"}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
        >
          {copied ? (
            <Check size={14} weight="bold" className="text-brand" />
          ) : (
            <CopySimple size={14} weight="bold" />
          )}
        </button>
      ) : null}
      {directionsUrl ? (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-brand transition hover:bg-brand/10"
        >
          <Compass size={14} weight="bold" />
          Get directions
        </a>
      ) : null}
    </span>
  );
}

export function PlaceAddressLabel({
  label,
  mapHref = null,
  className = "",
}: {
  label: string;
  mapHref?: string | null;
  className?: string;
}) {
  const isPlaceholder = label.includes("not listed");
  const toneClass = isPlaceholder ? "text-ink-muted italic" : "text-ink-secondary";

  const classes = [toneClass, className].filter(Boolean).join(" ");

  if (mapHref && !isPlaceholder) {
    return (
      <a
        href={mapHref}
        className={`${classes} transition hover:text-brand hover:underline hover:underline-offset-2`}
      >
        {label}
      </a>
    );
  }

  return <span className={classes}>{label}</span>;
}

interface PlaceAddressLineProps {
  place: Place;
  directionsUrl?: string | null;
  mapHref?: string | null;
  icon?: ReactNode;
}

export function PlaceAddressLine({
  place,
  directionsUrl = null,
  mapHref = null,
  icon,
}: PlaceAddressLineProps) {
  const locationMode = parseLocationMode(place.locationMode);
  const locationLabel = placeLocationLabel(place);
  const copyText = place.address?.trim() || null;
  const LocationIcon = locationMode === "online" ? Broadcast : MapPin;

  return (
    <p className="min-w-0 text-sm text-ink-secondary">
      <span className="mr-1.5 inline-flex align-text-top text-brand">
        {icon ?? <LocationIcon size={16} weight="bold" />}
      </span>
      <PlaceAddressLabel label={locationLabel} mapHref={mapHref} />
      <PlaceAddressActions copyText={copyText} directionsUrl={directionsUrl} />
    </p>
  );
}
