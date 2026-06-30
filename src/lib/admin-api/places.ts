import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { places } from "@/db/schema";
import { getPlaceById, getAllPlacesForAdmin } from "@/lib/data/places";
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

export async function listAdminPlaces() {
  return getAllPlacesForAdmin();
}

export async function getAdminPlace(id: string) {
  return getPlaceById(id, { includeDrafts: true });
}

export async function createAdminPlace(input: unknown) {
  const data = placeInputSchema.parse(input);
  await db.insert(places).values(placeRow(data));
  return getPlaceById(data.id, { includeDrafts: true });
}

export async function updateAdminPlace(originalId: string, input: unknown) {
  const data = placeInputSchema.parse(input);
  const [existing] = await db.select().from(places).where(eq(places.id, originalId)).limit(1);
  if (!existing) {
    throw new Error("Place not found");
  }

  await db.update(places).set(placeRow(data)).where(eq(places.id, originalId));
  return getPlaceById(data.id, { includeDrafts: true });
}

export async function deleteAdminPlace(id: string) {
  const [existing] = await db.select().from(places).where(eq(places.id, id)).limit(1);
  if (!existing) {
    throw new Error("Place not found");
  }

  await db.delete(places).where(eq(places.id, id));
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
