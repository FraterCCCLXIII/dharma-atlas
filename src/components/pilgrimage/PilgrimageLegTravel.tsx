import type { ReactNode } from "react";
import {
  AirplaneTilt,
  Bus,
  Car,
  Footprints,
  Path,
} from "@phosphor-icons/react/dist/ssr";
import {
  formatDistanceKm,
  getLegTravelLinks,
  haversineKm,
} from "@/lib/pilgrimage-travel";

type LegPoint = { name: string; lat: number; lng: number };

export function PilgrimageLegTravel({
  from,
  to,
}: {
  from: LegPoint;
  to: LegPoint;
}) {
  const links = getLegTravelLinks(from, to);
  const km = haversineKm(from, to);
  const distance = formatDistanceKm(km);

  return (
    <div className="px-1 py-1">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-ink-muted">
          <span className="text-ink-secondary">{from.name}</span>
          {" → "}
          <span className="text-ink-secondary">{to.name}</span>
          <span className="ml-1.5 text-ink-muted">· ~{distance}</span>
        </p>
        <div className="flex shrink-0 flex-nowrap gap-1.5">
          <TravelChip
            href={links.rome2Rio}
            label="All modes"
            icon={<Path size={12} weight="bold" />}
          />
          <TravelChip
            href={links.googleMapsDrive}
            label="Drive"
            icon={<Car size={12} weight="bold" />}
          />
          <TravelChip
            href={links.googleMapsWalk}
            label="Walk"
            icon={<Footprints size={12} weight="bold" />}
          />
          {km > 80 ? (
            <TravelChip
              href={links.rome2Rio}
              label="Flights"
              icon={<AirplaneTilt size={12} weight="bold" />}
            />
          ) : (
            <TravelChip
              href={links.rome2Rio}
              label="Bus / train"
              icon={<Bus size={12} weight="bold" />}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TravelChip({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink"
    >
      {icon}
      {label}
    </a>
  );
}
