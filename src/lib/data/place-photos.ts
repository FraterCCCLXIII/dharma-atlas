import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { placePhotos, places } from "@/db/schema";
import { isGeneratedPlacePhoto } from "@/lib/place-photo";
import type { PlacePhoto, PhotoSource } from "@/types/place";
import { MAX_PLACE_PHOTOS } from "@/types/place";

export { MAX_PLACE_PHOTOS };

export async function getPlacePhotos(placeId: string): Promise<PlacePhoto[]> {
  const rows = await db
    .select()
    .from(placePhotos)
    .where(eq(placePhotos.placeId, placeId))
    .orderBy(asc(placePhotos.sortOrder), asc(placePhotos.id));

  return rows.map((row) => ({
    id: row.id,
    path: row.path,
    photoSource: (row.photoSource as PhotoSource | null) ?? undefined,
    sortOrder: row.sortOrder,
  }));
}

export async function syncPlaceCoverPhoto(placeId: string): Promise<void> {
  const photos = await getPlacePhotos(placeId);
  const first = photos[0];

  const [row] = await db.select().from(places).where(eq(places.id, placeId)).limit(1);
  if (!row) return;

  const qualityFlags = row.qualityFlags.filter((flag) => flag !== "missing_photo");
  if (photos.length === 0) {
    qualityFlags.push("missing_photo");
  }

  await db
    .update(places)
    .set({
      photo: first?.path ?? null,
      photoSource: first?.photoSource ?? null,
      qualityFlags,
      updatedAt: new Date(),
    })
    .where(eq(places.id, placeId));
}

export async function attachPhotosToPlace<T extends { id: string; photo?: string; photoSource?: PhotoSource }>(
  place: T,
): Promise<T & { photos: PlacePhoto[] }> {
  const photos = await getPlacePhotos(place.id);
  if (photos.length > 0) {
    return { ...place, photos };
  }

  const legacyPath = place.photo?.trim();
  if (legacyPath && !isGeneratedPlacePhoto(legacyPath, place.photoSource)) {
    return {
      ...place,
      photos: [
        {
          id: 0,
          path: legacyPath,
          photoSource: place.photoSource,
          sortOrder: 0,
        },
      ],
    };
  }

  return { ...place, photos: [] };
}
