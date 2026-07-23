import Link from "next/link";
import { Path } from "@phosphor-icons/react/dist/ssr";
import {
  getPilgrimageImage,
  getRouteStopSites,
  pilgrimageSitePath,
  type PilgrimageRoute,
} from "@/data/pilgrimage";
import { traditionGradient } from "@/lib/places";
import { PilgrimageLegTravel } from "./PilgrimageLegTravel";
import { PilgrimageRouteActions } from "./PilgrimageRouteActions";
import { PilgrimageRouteWithMap } from "./PilgrimageRouteWithMap";

function stopLabel(site: {
  name: string;
  templeNumber?: number;
}): string {
  if (site.templeNumber != null) {
    return `Temple ${site.templeNumber} — ${site.name}`;
  }
  return site.name;
}

export function PilgrimageRouteView({ route }: { route: PilgrimageRoute }) {
  const stopSites = getRouteStopSites(route);
  const showMap = stopSites.length >= 2;

  if (showMap) {
    return <PilgrimageRouteWithMap route={route} />;
  }

  const image = getPilgrimageImage(route.slug);
  const stops = stopSites.map((site) => ({
    slug: site.slug,
    name: stopLabel(site),
    country: site.country,
    description: site.summary,
    image: getPilgrimageImage(site.slug),
    templeNumber: site.templeNumber,
  }));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <header className="min-w-0">
          <div
            className={`relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-gradient-to-br shadow-[var(--shadow-card)] ${traditionGradient(route.tradition)}`}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
            <Path size={14} weight="bold" />
            Route
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {route.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-secondary">
            {route.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-ink-secondary">
              {route.tradition}
            </span>
            <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-ink-secondary">
              {route.region}
            </span>
            <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-ink-secondary">
              {route.lengthNote}
            </span>
          </div>
          <PilgrimageRouteActions
            slug={route.slug}
            name={route.name}
            summary={route.summary}
          />
        </header>

        <div className="min-w-0 space-y-10">
          {route.significance ? (
            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                About this route
              </h2>
              <p className="text-base leading-relaxed text-ink-secondary">
                {route.significance}
              </p>
            </section>
          ) : null}

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
              Key temples
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">
              {stops.length} mapped anchors on the circuit.
            </p>
            <ol className="mt-4 space-y-3">
              {stops.map((stop, index) => (
                <li key={stop.slug} className="space-y-2">
                  {index > 0 && stopSites[index - 1] && stopSites[index] ? (
                    <PilgrimageLegTravel
                      from={stopSites[index - 1]!}
                      to={stopSites[index]!}
                    />
                  ) : null}
                  <Link
                    href={pilgrimageSitePath(stop.slug)}
                    className="flex gap-3 rounded-xl border border-border bg-surface-elevated p-3 transition hover:bg-surface-muted"
                  >
                    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                      {stop.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={stop.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                      <span className="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
                        {stop.templeNumber ?? index + 1}
                      </span>
                    </span>
                    <span className="min-w-0 py-0.5">
                      <span className="block text-sm font-semibold text-ink">
                        {stop.name}
                      </span>
                      {stop.country ? (
                        <span className="mt-0.5 block text-xs text-ink-muted">
                          {stop.country}
                        </span>
                      ) : null}
                      {stop.description ? (
                        <span className="mt-1 block line-clamp-2 text-sm leading-relaxed text-ink-secondary">
                          {stop.description}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
