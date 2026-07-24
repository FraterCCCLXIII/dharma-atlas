import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PilgrimageCustomizeEditor } from "@/components/pilgrimage/PilgrimageCustomizeEditor";
import { getPilgrimageRoute } from "@/data/pilgrimage";
import { getSession } from "@/lib/auth-server";
import { getUserPilgrimageRoute } from "@/lib/data/user-pilgrimage-routes";
import { SHOW_PILGRIMAGE } from "@/lib/feature-flags";
import type { PilgrimageRoute } from "@/data/pilgrimage";
import type { PlaceStopDetails } from "@/lib/pilgrimage-stop-ref";
import { placeIdFromStopRef } from "@/lib/pilgrimage-stop-ref";
import { db } from "@/db/client";
import { places } from "@/db/schema";
import { inArray } from "drizzle-orm";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Edit route | Pilgrimage | Dharma Atlas",
  robots: { index: false, follow: false },
};

function syntheticBaseRoute(
  title: string,
  id: string,
  stopSlugs: string[],
): PilgrimageRoute {
  return {
    slug: id,
    name: title,
    kind: "route",
    region: "West",
    tradition: "Buddhist",
    summary: "",
    lengthNote: "",
    stopSlugs,
  };
}

export default async function EditUserPilgrimageRoutePage({ params }: Props) {
  if (!SHOW_PILGRIMAGE) notFound();
  const session = await getSession();
  const { id } = await params;
  if (!session) {
    redirect(`/login?redirect=${encodeURIComponent(`/pilgrimage/my/${id}/edit`)}`);
  }

  const saved = await getUserPilgrimageRoute(session.user.id, id);
  if (!saved) notFound();

  const base = saved.baseRouteSlug
    ? getPilgrimageRoute(saved.baseRouteSlug)
    : undefined;
  const mapRoute =
    base ?? syntheticBaseRoute(saved.title, saved.id, saved.stopSlugs);

  // Prefill place details for non-catalog stops so the editor can render them.
  const placeIds = saved.stopSlugs
    .map((ref) => placeIdFromStopRef(ref))
    .filter((placeId): placeId is string => Boolean(placeId));
  const initialPlaceDetails: Record<string, PlaceStopDetails> = {};
  if (placeIds.length > 0) {
    const rows = await db
      .select({
        id: places.id,
        name: places.name,
        lat: places.lat,
        lng: places.lng,
        address: places.address,
        photo: places.photo,
        slug: places.slug,
        pilgrimageSlug: places.pilgrimageSlug,
      })
      .from(places)
      .where(inArray(places.id, placeIds));
    for (const row of rows) {
      initialPlaceDetails[row.id] = row;
    }
  }

  return (
    <PilgrimageCustomizeEditor
      route={mapRoute}
      savedRoute={{
        id: saved.id,
        title: saved.title,
        stopSlugs: saved.stopSlugs,
        baseRouteSlug: saved.baseRouteSlug,
        shareId: saved.shareId,
      }}
      initialPlaceDetails={initialPlaceDetails}
    />
  );
}
