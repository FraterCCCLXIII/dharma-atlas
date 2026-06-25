import Link from "next/link";
import { Globe, MapPin, Phone } from "@phosphor-icons/react";
import {
  displayWebsite,
  formatPhoneHref,
  formatWebsiteHref,
} from "@/lib/place-contact";
import type { Place } from "@/types/place";

interface PlaceContactDetailsProps {
  place: Place;
  compact?: boolean;
}

export function PlaceContactDetails({
  place,
  compact = false,
}: PlaceContactDetailsProps) {
  const address = place.address?.trim();
  const phone = place.phone?.trim();
  const website = place.website?.trim();

  return (
    <dl className={`space-y-3 text-sm ${compact ? "" : "border-t border-border pt-4"}`}>
      <div className="flex gap-3">
        <dt className="sr-only">Address</dt>
        <MapPin size={18} weight="bold" className="mt-0.5 shrink-0 text-brand" />
        <dd className={address ? "text-ink-secondary" : "text-ink-muted italic"}>
          {address || "Address not listed"}
        </dd>
      </div>

      <div className="flex gap-3">
        <dt className="sr-only">Phone</dt>
        <Phone size={18} weight="bold" className="mt-0.5 shrink-0 text-brand" />
        <dd>
          {phone ? (
            <a
              href={formatPhoneHref(phone)}
              className="font-medium text-ink transition hover:text-brand"
            >
              {phone}
            </a>
          ) : (
            <span className="text-ink-muted italic">Phone not listed</span>
          )}
        </dd>
      </div>

      <div className="flex gap-3">
        <dt className="sr-only">Website</dt>
        <Globe size={18} weight="bold" className="mt-0.5 shrink-0 text-brand" />
        <dd className="min-w-0">
          {website ? (
            <Link
              href={formatWebsiteHref(website)}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-medium text-brand underline-offset-2 hover:underline"
            >
              {displayWebsite(website)}
            </Link>
          ) : (
            <span className="text-ink-muted italic">Website not listed</span>
          )}
        </dd>
      </div>
    </dl>
  );
}
