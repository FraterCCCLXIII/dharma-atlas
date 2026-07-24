import { getPilgrimageRoute, type PilgrimageRoute } from "@/data/pilgrimage";
import { resolveRouteStops } from "@/lib/data/resolve-route-stops";
import type { UserPilgrimageRouteRow } from "@/db/schema";
import { UserPilgrimageRouteLayout } from "./UserPilgrimageRouteLayout";

function mapRouteForSaved(
  saved: UserPilgrimageRouteRow,
  base: PilgrimageRoute | undefined,
  stopCount: number,
): PilgrimageRoute {
  return {
    slug: saved.id,
    name: saved.title,
    kind: "route",
    region: base?.region ?? "West",
    tradition: base?.tradition ?? "Buddhist",
    summary: saved.notes?.trim() || base?.summary || "",
    lengthNote: `${stopCount} stops`,
    stopSlugs: saved.stopSlugs,
  };
}

export async function UserPilgrimageRouteView({
  route,
  isOwner = false,
}: {
  route: UserPilgrimageRouteRow;
  isOwner?: boolean;
}) {
  const base = route.baseRouteSlug
    ? getPilgrimageRoute(route.baseRouteSlug)
    : undefined;
  const stops = await resolveRouteStops(route.stopSlugs);
  const mapRoute = mapRouteForSaved(route, base, stops.length);

  return (
    <UserPilgrimageRouteLayout
      routeId={route.id}
      title={route.title}
      notes={route.notes}
      shareId={route.shareId}
      isOwner={isOwner}
      baseRoute={base ? { slug: base.slug, name: base.name } : null}
      mapRoute={mapRoute}
      stops={stops}
    />
  );
}
