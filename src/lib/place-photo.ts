import type { Place, PlacePhoto } from "@/types/place";

export function isGeneratedPlacePhoto(
  photo: string | null | undefined,
  photoSource?: string | null,
): boolean {
  if (photoSource === "generated") return true;
  if (photo?.includes("/places/generated/")) return true;
  return false;
}

export function getPlaceDisplayPhotos(
  place: {
    photo?: string | null;
    photoSource?: Place["photoSource"] | null;
    photos?: PlacePhoto[];
  },
): string[] {
  const fromGallery = (place.photos ?? [])
    .filter(
      (entry) =>
        entry.path.trim() &&
        !isGeneratedPlacePhoto(entry.path, entry.photoSource ?? place.photoSource),
    )
    .map((entry) => entry.path.trim());

  if (fromGallery.length > 0) {
    return fromGallery;
  }

  const photo = place.photo?.trim();
  if (!photo || isGeneratedPlacePhoto(photo, place.photoSource)) return [];
  return [photo];
}

export function hasDisplayablePlacePhoto(
  place: {
    photo?: string | null;
    photoSource?: Place["photoSource"] | null;
    photos?: PlacePhoto[];
  },
): boolean {
  return getPlaceDisplayPhotos(place).length > 0;
}
