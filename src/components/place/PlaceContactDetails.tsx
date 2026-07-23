import Link from "next/link";
import { Broadcast, Globe, MapPin, Phone } from "@phosphor-icons/react";
import {
  PlaceAddressActions,
  PlaceAddressLabel,
} from "@/components/place/PlaceAddressLine";
import { PlaceSocialIcon } from "@/components/place/PlaceSocialIcon";
import {
  displayWebsite,
  formatPhoneHref,
  formatWebsiteHref,
} from "@/lib/place-contact";
import { parseLocationMode, placeLocationLabel } from "@/lib/place-location";
import { placeSocialDisplayLabel } from "@/lib/place-socials";
import type { Place, PlaceSocial } from "@/types/place";

interface PlaceContactDetailsProps {
  place: Place;
  socials?: PlaceSocial[];
  compact?: boolean;
  directionsUrl?: string | null;
  mapHref?: string | null;
}

export function PlaceContactDetails({
  place,
  socials = [],
  compact = false,
  directionsUrl = null,
  mapHref = null,
}: PlaceContactDetailsProps) {
  const locationLabel = placeLocationLabel(place);
  const mode = parseLocationMode(place.locationMode);
  const phone = place.phone?.trim();
  const website = place.website?.trim();
  const copyText = place.address?.trim() || null;
  const LocationIcon = mode === "online" ? Broadcast : MapPin;

  return (
    <div className={`space-y-3 text-sm ${compact ? "" : "border-t border-border pt-4"}`}>
      <dl className="space-y-3">
        <div className="flex gap-3">
          <dt className="sr-only">Location</dt>
          <LocationIcon size={18} weight="bold" className="mt-0.5 shrink-0 text-brand" />
          <dd className="min-w-0 text-ink-secondary">
            <PlaceAddressLabel label={locationLabel} mapHref={mapHref} />
            <PlaceAddressActions copyText={copyText} directionsUrl={directionsUrl} />
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

      {socials.length > 0 ? (
        <div className="border-t border-border pt-3">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {socials.map((social) => {
              const label = placeSocialDisplayLabel(social);
              return (
                <li key={social.id}>
                  <a
                    href={formatWebsiteHref(social.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="inline-flex items-center gap-1.5 text-ink-secondary transition hover:text-brand"
                  >
                    <PlaceSocialIcon
                      platform={social.platform}
                      size={18}
                      className="shrink-0"
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
