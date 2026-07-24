import { MapPin, Signpost } from "@phosphor-icons/react/dist/ssr";
import {
  getPilgrimageImage,
  PILGRIMAGE_ROUTES,
  type PilgrimageSite,
} from "@/data/pilgrimage";
import { PlacePilgrimageRoutes } from "@/components/place/PlacePilgrimageRoutes";
import { firstDescriptionLine } from "@/lib/text-preview";
import { traditionGradient } from "@/lib/places";
import { PilgrimageSiteActions } from "./PilgrimageSiteActions";

export function PilgrimageSiteView({ site }: { site: PilgrimageSite }) {
  const routes = PILGRIMAGE_ROUTES.filter((route) =>
    route.stopSlugs.includes(site.slug),
  ).map((route) => ({
    slug: route.slug,
    name: route.name,
    region: route.region,
    tradition: route.tradition,
    summary: route.summary,
    blurb: firstDescriptionLine(route.summary),
    image: getPilgrimageImage(route.slug),
  }));
  const image = getPilgrimageImage(site.slug);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${site.lat},${site.lng}`;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <header>
        <div
          className={`relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-gradient-to-br shadow-[var(--shadow-card)] ${traditionGradient(site.tradition)}`}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
          <Signpost size={14} weight="bold" />
          Location
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {site.name}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-secondary">
          {site.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-ink-secondary">
            {site.tradition}
          </span>
          <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-ink-secondary">
            {site.region}
          </span>
          <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-ink-secondary">
            {site.country}
          </span>
        </div>
        <PilgrimageSiteActions
          slug={site.slug}
          name={site.name}
          summary={site.summary}
        />
      </header>

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          Significance
        </h2>
        <p className="text-base leading-relaxed text-ink-secondary">
          {site.significance}
        </p>
      </section>

      <section className="mt-10">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-border-strong hover:bg-surface-muted"
        >
          <MapPin size={16} weight="bold" />
          Open in Google Maps
        </a>
      </section>

      <PlacePilgrimageRoutes routes={routes} />
    </div>
  );
}
