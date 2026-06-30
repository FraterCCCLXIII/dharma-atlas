import { randomBytes } from "node:crypto";
import { count, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { placePhotos } from "@/db/schema";
import { getPlacePhotos, syncPlaceCoverPhoto } from "@/lib/data/place-photos";
import { AdminApiError } from "@/lib/admin-api/errors";
import {
  deleteLocalPlacePhoto,
  PLACE_PHOTO_MAX_BYTES,
  resolveImageContentType,
  saveLocalPlacePhoto,
} from "@/lib/place-photo-files";
import { MAX_PLACE_PHOTOS, type PlacePhoto } from "@/types/place";

export async function listAdminPlacePhotos(placeId: string) {
  return getPlacePhotos(placeId);
}

export async function uploadAdminPlacePhoto(placeId: string, file: File) {
  const normalizedId = placeId.trim();
  if (!normalizedId) {
    throw new AdminApiError(400, "Place ID is required.");
  }
  if (!(file instanceof File) || file.size === 0) {
    throw new AdminApiError(400, "Choose an image file to upload.");
  }
  if (file.size > PLACE_PHOTO_MAX_BYTES) {
    throw new AdminApiError(400, "Image must be 5 MB or smaller.");
  }

  const [existingCount] = await db
    .select({ count: count() })
    .from(placePhotos)
    .where(eq(placePhotos.placeId, normalizedId));

  if ((existingCount?.count ?? 0) >= MAX_PLACE_PHOTOS) {
    throw new AdminApiError(400, `You can add up to ${MAX_PLACE_PHOTOS} photos per location.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = resolveImageContentType(buffer, file.type);
  const fileKey = randomBytes(4).toString("hex");
  const path = saveLocalPlacePhoto(normalizedId, fileKey, buffer, contentType);

  const [inserted] = await db
    .insert(placePhotos)
    .values({
      placeId: normalizedId,
      path,
      photoSource: "admin",
      sortOrder: existingCount?.count ?? 0,
    })
    .returning({
      id: placePhotos.id,
      path: placePhotos.path,
      photoSource: placePhotos.photoSource,
      sortOrder: placePhotos.sortOrder,
    });

  await syncPlaceCoverPhoto(normalizedId);

  const photo: PlacePhoto = {
    id: inserted.id,
    path: inserted.path,
    photoSource: (inserted.photoSource as PlacePhoto["photoSource"]) ?? undefined,
    sortOrder: inserted.sortOrder,
  };

  return { photo };
}

export async function deleteAdminPlacePhoto(placeId: string, photoId: number) {
  const [row] = await db
    .select()
    .from(placePhotos)
    .where(eq(placePhotos.id, photoId))
    .limit(1);

  if (!row || row.placeId !== placeId) {
    throw new AdminApiError(404, "Photo not found.");
  }

  if (row.path.startsWith("/places/") && !row.path.includes("/generated/")) {
    deleteLocalPlacePhoto(row.path);
  }

  await db.delete(placePhotos).where(eq(placePhotos.id, photoId));
  await syncPlaceCoverPhoto(placeId);

  return { ok: true as const, photoId };
}
