"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { places } from "@/db/schema";
import { revalidatePlacePaths } from "@/lib/admin-api/revalidate";
import { requirePermission } from "@/lib/auth-server";
import {
  allocateUniquePlaceSlug,
  assertUniquePlaceSlug,
} from "@/lib/data/place-slugs";
import { placeInputSchema, type PlaceInput } from "@/lib/validations/place";

function placeRow(input: PlaceInput, slug: string) {
  return {
    id: input.id,
    slug,
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
    notice: input.notice ?? null,
    locationMode: input.locationMode,
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
    offerings: input.offerings ?? [],
    isDraft: input.isDraft,
    updatedAt: new Date(),
  };
}

async function resolveAdminPlaceSlug(
  input: PlaceInput,
  options?: { excludePlaceId?: string; existingSlug?: string | null },
) {
  const raw = input.slug?.trim();
  if (raw) {
    return assertUniquePlaceSlug(raw, options?.excludePlaceId);
  }
  if (options?.existingSlug) return options.existingSlug;
  return allocateUniquePlaceSlug({
    name: input.name,
    address: input.address,
    fallbackId: input.id,
    excludePlaceId: options?.excludePlaceId,
  });
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

  revalidatePlacePaths(placeId, row.slug);
}

export async function createPlaceAction(input: PlaceInput) {
  await requirePermission("place", "create");
  const data = placeInputSchema.parse(input);
  const slug = await resolveAdminPlaceSlug(data);

  await db.insert(places).values(placeRow(data, slug));

  revalidatePlacePaths(data.id, slug);
  redirect(`/admin/places/${data.id}/edit`);
}

export async function updatePlaceAction(originalId: string, input: PlaceInput) {
  await requirePermission("place", "update");
  const data = placeInputSchema.parse(input);
  const [existing] = await db
    .select({ slug: places.slug })
    .from(places)
    .where(eq(places.id, originalId))
    .limit(1);
  const slug = await resolveAdminPlaceSlug(data, {
    excludePlaceId: originalId,
    existingSlug: existing?.slug,
  });

  await db.update(places).set(placeRow(data, slug)).where(eq(places.id, originalId));

  revalidatePlacePaths(data.id, slug, existing?.slug);
  if (originalId !== data.id) {
    revalidatePlacePaths(originalId, existing?.slug);
  }
  redirect("/admin/places");
}

/** Soft-delete from admin edit — retained for restore or permanent delete. */
export async function deletePlaceAction(id: string) {
  await requirePermission("place", "delete");
  const [row] = await db.select({ slug: places.slug }).from(places).where(eq(places.id, id)).limit(1);
  await db
    .update(places)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(places.id, id));

  revalidatePlacePaths(id, row?.slug);
  revalidatePath("/admin/location-reviews");
  revalidatePath("/manage");
  redirect("/admin/location-reviews");
}

export async function restorePlaceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Invalid place id");

  await requirePermission("place", "update");
  const [row] = await db.select({ slug: places.slug }).from(places).where(eq(places.id, id)).limit(1);
  await db
    .update(places)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(places.id, id));

  revalidatePlacePaths(id, row?.slug);
  revalidatePath("/admin/location-reviews");
  revalidatePath("/manage");
  redirect("/admin/location-reviews");
}

/** Irreversible hard delete. */
export async function permanentlyDeletePlaceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Invalid place id");

  await requirePermission("place", "delete");
  const [row] = await db.select({ slug: places.slug }).from(places).where(eq(places.id, id)).limit(1);
  await db.delete(places).where(eq(places.id, id));

  revalidatePlacePaths(id, row?.slug);
  revalidatePath("/admin/location-reviews");
  revalidatePath("/manage");
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

  revalidatePlacePaths(id, row.slug);
  revalidatePath("/admin/location-reviews");
  revalidatePath("/manage");
  redirect("/admin/location-reviews");
}
