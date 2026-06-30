"use server";

import { randomBytes } from "node:crypto";
import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { placePhotos } from "@/db/schema";
import { requireSession } from "@/lib/auth-server";
import { getPlacePhotos, syncPlaceCoverPhoto } from "@/lib/data/place-photos";
import { MAX_PLACE_PHOTOS, type PlacePhoto } from "@/types/place";
import { canEditPlace } from "@/lib/place-access";
import {
  deleteLocalPlacePhoto,
  PLACE_PHOTO_MAX_BYTES,
  resolveImageContentType,
  saveLocalPlacePhoto,
} from "@/lib/place-photo-files";
import { roles, type AppRole } from "@/lib/permissions";

async function requirePlacePhotoPermission(placeId: string) {
  const session = await requireSession();
  const role: AppRole = session.user.role === "owner" ? "owner" : "editor";
  const adminUpdate = roles[role].authorize({ place: ["update"] }).success;
  const adminCreate = roles[role].authorize({ place: ["create"] }).success;
  const ownerAccess = await canEditPlace(session.user.id, session.user.role, placeId);

  if (!adminUpdate && !adminCreate && !ownerAccess) {
    throw new Error("Forbidden");
  }

  return session;
}

export async function listPlacePhotosAction(placeId: string) {
  await requirePlacePhotoPermission(placeId);
  return getPlacePhotos(placeId);
}

export async function uploadPlacePhotoAction(placeId: string, formData: FormData) {
  await requirePlacePhotoPermission(placeId);

  const normalizedId = placeId.trim();
  if (!normalizedId) throw new Error("Place ID is required before uploading a photo.");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image file to upload.");
  }
  if (file.size > PLACE_PHOTO_MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const [existingCount] = await db
    .select({ count: count() })
    .from(placePhotos)
    .where(eq(placePhotos.placeId, normalizedId));

  if ((existingCount?.count ?? 0) >= MAX_PLACE_PHOTOS) {
    throw new Error(`You can add up to ${MAX_PLACE_PHOTOS} photos per location.`);
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

  revalidatePath(`/place/${normalizedId}`);
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath("/admin/places");
  revalidatePath(`/admin/places/${normalizedId}/edit`);
  revalidatePath(`/manage/places/${normalizedId}/edit`);

  return {
    photo: {
      id: inserted.id,
      path: inserted.path,
      photoSource: (inserted.photoSource as PlacePhoto["photoSource"]) ?? undefined,
      sortOrder: inserted.sortOrder,
    },
  };
}

export async function deletePlacePhotoAction(placeId: string, photoId: number) {
  await requirePlacePhotoPermission(placeId);

  const [row] = await db
    .select()
    .from(placePhotos)
    .where(eq(placePhotos.id, photoId))
    .limit(1);

  if (!row || row.placeId !== placeId) {
    throw new Error("Photo not found.");
  }

  if (row.path.startsWith("/places/") && !row.path.includes("/generated/")) {
    deleteLocalPlacePhoto(row.path);
  }

  await db.delete(placePhotos).where(eq(placePhotos.id, photoId));
  await syncPlaceCoverPhoto(placeId);

  revalidatePath(`/place/${placeId}`);
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath("/admin/places");
  revalidatePath(`/admin/places/${placeId}/edit`);
  revalidatePath(`/manage/places/${placeId}/edit`);

  return { ok: true };
}
