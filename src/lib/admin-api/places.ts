import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { places } from "@/db/schema";
import {
  allocateUniquePlaceSlug,
  assertUniquePlaceSlug,
} from "@/lib/data/place-slugs";
import { getPlaceById, getAllPlacesForAdmin } from "@/lib/data/places";
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

export async function listAdminPlaces() {
  return getAllPlacesForAdmin();
}

export async function getAdminPlace(id: string) {
  return getPlaceById(id, { includeDrafts: true });
}

export async function createAdminPlace(input: unknown) {
  const data = placeInputSchema.parse(input);
  const slug = await resolveAdminPlaceSlug(data);
  await db.insert(places).values(placeRow(data, slug));
  return getPlaceById(data.id, { includeDrafts: true });
}

export async function updateAdminPlace(originalId: string, input: unknown) {
  const data = placeInputSchema.parse(input);
  const [existing] = await db.select().from(places).where(eq(places.id, originalId)).limit(1);
  if (!existing) {
    throw new Error("Place not found");
  }

  const slug = await resolveAdminPlaceSlug(data, {
    excludePlaceId: originalId,
    existingSlug: existing.slug,
  });
  await db.update(places).set(placeRow(data, slug)).where(eq(places.id, originalId));
  return getPlaceById(data.id, { includeDrafts: true });
}

export async function deleteAdminPlace(id: string) {
  const [existing] = await db.select().from(places).where(eq(places.id, id)).limit(1);
  if (!existing) {
    throw new Error("Place not found");
  }

  await db
    .update(places)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(places.id, id));
  return { id, deleted: true };
}

export async function verifyAdminPlaceField(placeId: string, field: string) {
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

  return getPlaceById(placeId, { includeDrafts: true });
}
