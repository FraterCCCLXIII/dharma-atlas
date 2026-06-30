import type { Place } from "@/types/place";

export function isGeneratedPlacePhoto(
  photo: string | null | undefined,
  photoSource?: string | null,
): boolean {
  if (photoSource === "generated") return true;
  if (photo?.includes("/places/generated/")) return true;
  return false;
}

export function getPlaceDisplayPhotos(
  place: { photo?: string | null; photoSource?: Place["photoSource"] | null },
): string[] {
  const photo = place.photo?.trim();
  if (!photo || isGeneratedPlacePhoto(photo, place.photoSource)) return [];
  return [photo];
}

export function hasDisplayablePlacePhoto(
  place: { photo?: string | null; photoSource?: Place["photoSource"] | null },
): boolean {
  return getPlaceDisplayPhotos(place).length > 0;
}
