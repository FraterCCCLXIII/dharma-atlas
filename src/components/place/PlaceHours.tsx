import { Clock } from "@phosphor-icons/react";
import { formatPlaceOpeningHours, placeHoursOpenNow } from "@/lib/place-hours";
import type { Place } from "@/types/place";

interface PlaceHoursProps {
  place: Place;
}

export function PlaceHours({ place }: PlaceHoursProps) {
  const lines = formatPlaceOpeningHours(place.openingHours);
  if (!lines.length) return null;

  const openNow = placeHoursOpenNow(place);

  return (
    <div className="flex gap-3 text-sm">
      <Clock size={18} weight="bold" className="mt-0.5 shrink-0 text-brand" />
      <div className="space-y-1">
        {openNow != null && (
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {openNow ? "Open now" : "Closed now"}
          </p>
        )}
        <ul className="space-y-0.5 text-ink-secondary">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
