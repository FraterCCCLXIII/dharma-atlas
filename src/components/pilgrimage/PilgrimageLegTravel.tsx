import type { ReactNode } from "react";
import {
  AirplaneTilt,
  Bus,
  Car,
  Footprints,
  Path,
} from "@phosphor-icons/react/dist/ssr";
import type { PilgrimageSite } from "@/data/pilgrimage";
import {
  formatDistanceKm,
  getLegTravelLinks,
  haversineKm,
} from "@/lib/pilgrimage-travel";

export function PilgrimageLegTravel({
  from,
  to,
}: {
  from: PilgrimageSite;
  to: PilgrimageSite;
}) {
  const links = getLegTravelLinks(from, to);
  const km = haversineKm(from, to);
  const distance = formatDistanceKm(km);

  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-ink-muted">
          <span className="text-ink-secondary">{from.name}</span>
          {" → "}
          <span className="text-ink-secondary">{to.name}</span>
          <span className="ml-1.5 text-ink-muted">· ~{distance}</span>
        </p>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <TravelChip href={links.rome2Rio} label="All modes" icon={<Path size={12} weight="bold" />} />
        <TravelChip href={links.googleMapsDrive} label="Drive" icon={<Car size={12} weight="bold" />} />
        <TravelChip href={links.googleMapsWalk} label="Walk" icon={<Footprints size={12} weight="bold" />} />
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
