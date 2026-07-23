import Link from "next/link";
import type { PlacePilgrimageRouteRef } from "@/lib/data/pilgrimage-routes";

interface PlacePilgrimageRoutesProps {
  routes: PlacePilgrimageRouteRef[];
}

export function PlacePilgrimageRoutes({ routes }: PlacePilgrimageRoutesProps) {
  if (routes.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        On these routes
      </h2>
      <ul className="mt-4 space-y-2">
        {routes.map((route) => (
          <li key={route.slug}>
            <Link
              href={`/pilgrimage/routes/${route.slug}`}
              className="block rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm font-medium text-ink transition hover:bg-surface-muted"
            >
              {route.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
