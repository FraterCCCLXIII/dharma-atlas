import type { places } from "@/db/schema";
import type { Place, PlaceMarker, Faith, PlaceType } from "@/types/place";

type PlaceMarkerRow = Pick<
  typeof places.$inferSelect,
  | "id"
  | "name"
  | "lat"
  | "lng"
  | "tradition"
  | "faith"
  | "type"
  | "address"
  | "photo"
  | "schools"
>;

export function rowToPlaceMarker(row: PlaceMarkerRow): PlaceMarker {
  return {
    id: row.id,
    name: row.name,
    lat: row.lat,
    lng: row.lng,
    tradition: row.tradition,
    faith: row.faith as Faith,
    type: row.type as PlaceType,
    address: row.address,
    photo: row.photo ?? undefined,
    schools: row.schools.length ? row.schools : undefined,
  };
}

export function rowToPlace(row: typeof places.$inferSelect): Place {
  return {
    id: row.id,
    name: row.name,
    lat: row.lat,
    lng: row.lng,
    tradition: row.tradition,
    faith: row.faith as Faith,
    type: row.type as PlaceType,
    folder: row.folder,
    address: row.address,
    phone: row.phone,
    website: row.website,
    schools: row.schools.length ? row.schools : undefined,
    description: row.description ?? undefined,
    descriptionSource: row.descriptionSource ?? undefined,
    coordPrecision: (row.coordPrecision as Place["coordPrecision"]) ?? "unknown",
    dataSource: row.dataSource ?? undefined,
    verifiedAt: row.verifiedAt?.toISOString(),
    verifiedFields: row.verifiedFields.length ? row.verifiedFields : undefined,
    qualityFlags: row.qualityFlags.length ? row.qualityFlags : undefined,
    photo: row.photo ?? undefined,
    photoSource: (row.photoSource as Place["photoSource"]) ?? undefined,
    googlePlaceId: row.googlePlaceId ?? undefined,
    googleMapsUri: row.googleMapsUri ?? undefined,
    openingHours: parseOpeningHours(row.openingHours),
    googleRating: row.googleRating ?? undefined,
    googleRatingCount: row.googleRatingCount ?? undefined,
    businessStatus: row.businessStatus ?? undefined,
    googlePrimaryType: row.googlePrimaryType ?? undefined,
    isDraft: row.isDraft,
    publishRequestedAt: row.publishRequestedAt?.toISOString(),
    deletedAt: row.deletedAt?.toISOString(),
  };
}

function parseOpeningHours(raw: string | null): Place["openingHours"] {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as Place["openingHours"];
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}
