"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { places } from "@/db/schema";
import { revalidateExploreMarkers } from "@/lib/admin-api/revalidate";
import { requirePermission } from "@/lib/auth-server";
import { placeInputSchema, type PlaceInput } from "@/lib/validations/place";

function placeRow(input: PlaceInput) {
  return {
    id: input.id,
    name: input.name,
    lat: input.lat,
    lng: input.lng,
    tradition: input.tradition,
    faith: input.faith,
    type: input.type,
    folder: input.folder,
    address: input.address,
    phone: input.phone ?? null,
    website: input.website ?? null,
    description: input.description ?? null,
    descriptionSource: input.descriptionSource ?? null,
    coordPrecision: input.coordPrecision,
    dataSource: input.dataSource ?? null,
    verifiedFields: input.verifiedFields,
    qualityFlags: input.qualityFlags,
    photo: input.photo ?? null,
    photoSource: input.photoSource ?? null,
    googlePlaceId: input.googlePlaceId ?? null,
    googleMapsUri: input.googleMapsUri ?? null,
    openingHours: input.openingHours ? JSON.stringify(input.openingHours) : null,
    googleRating: input.googleRating ?? null,
    googleRatingCount: input.googleRatingCount ?? null,
    businessStatus: input.businessStatus ?? null,
    googlePrimaryType: input.googlePrimaryType ?? null,
    schools: input.schools,
    isDraft: input.isDraft,
    updatedAt: new Date(),
  };
}

export async function verifyPlaceFieldAction(placeId: string, field: string) {
  await requirePermission("place", "update");
  const [row] = await db.select().from(places).where(eq(places.id, placeId)).limit(1);
  if (!row) throw new Error("Place not found");

  const verifiedFields = [...new Set([...row.verifiedFields, field])];
  const qualityFlags = row.qualityFlags.filter(
    (flag) => flag !== `unverified_${field}` && flag !== "unverified_description",
  );

  await db
    .update(places)
    .set({
      verifiedFields,
      qualityFlags,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(places.id, placeId));

  revalidatePath("/");
  revalidatePath("/places");
  revalidatePath(`/place/${placeId}`);
  revalidatePath("/admin/places");
  revalidateExploreMarkers();
}

export async function createPlaceAction(input: PlaceInput) {
  await requirePermission("place", "create");
  const data = placeInputSchema.parse(input);

  await db.insert(places).values(placeRow(data));

  revalidatePath("/");
  revalidatePath("/places");
  revalidatePath(`/place/${data.id}`);
  revalidatePath("/admin/places");
  revalidateExploreMarkers();
  redirect(`/admin/places/${data.id}/edit`);
}

export async function updatePlaceAction(originalId: string, input: PlaceInput) {
  await requirePermission("place", "update");
  const data = placeInputSchema.parse(input);

  await db.update(places).set(placeRow(data)).where(eq(places.id, originalId));

  revalidatePath("/");
  revalidatePath("/places");
  revalidatePath(`/place/${originalId}`);
  revalidatePath(`/place/${data.id}`);
  revalidatePath("/admin/places");
  revalidateExploreMarkers();
  redirect("/admin/places");
}

/** Soft-delete from admin edit — retained for restore or permanent delete. */
export async function deletePlaceAction(id: string) {
  await requirePermission("place", "delete");
  await db
    .update(places)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(places.id, id));

  revalidatePath("/");
  revalidatePath("/places");
  revalidatePath(`/place/${id}`);
  revalidatePath("/admin/places");
  revalidatePath("/admin/location-reviews");
  revalidatePath("/manage");
  revalidateExploreMarkers();
  redirect("/admin/location-reviews");
}

export async function restorePlaceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Invalid place id");

  await requirePermission("place", "update");
  await db
    .update(places)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(places.id, id));

  revalidatePath("/");
  revalidatePath("/places");
  revalidatePath(`/place/${id}`);
  revalidatePath("/admin/places");
  revalidatePath("/admin/location-reviews");
  revalidatePath("/manage");
  revalidateExploreMarkers();
  redirect("/admin/location-reviews");
}

/** Irreversible hard delete. */
export async function permanentlyDeletePlaceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Invalid place id");

  await requirePermission("place", "delete");
  await db.delete(places).where(eq(places.id, id));

  revalidatePath("/");
  revalidatePath("/places");
  revalidatePath(`/place/${id}`);
  revalidatePath("/admin/places");
  revalidatePath("/admin/location-reviews");
  revalidatePath("/manage");
  revalidateExploreMarkers();
  redirect("/admin/location-reviews");
}

export async function publishDraftPlaceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Invalid place id");

  await requirePermission("place", "update");
  const [row] = await db.select().from(places).where(eq(places.id, id)).limit(1);
  if (!row) throw new Error("Place not found");
  if (row.deletedAt || !row.isDraft) {
    redirect("/admin/location-reviews");
  }

  await db
    .update(places)
    .set({
      isDraft: false,
      publishRequestedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(places.id, id));

  revalidatePath("/");
  revalidatePath("/places");
  revalidatePath(`/place/${id}`);
  revalidatePath("/admin/places");
  revalidatePath("/admin/location-reviews");
  revalidatePath("/manage");
  revalidateExploreMarkers();
  redirect("/admin/location-reviews");
}
