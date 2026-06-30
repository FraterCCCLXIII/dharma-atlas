import type { Place, PlacePhoto } from "@/types/place";
import { lookupTraditionDefaultImage } from "@/lib/ontology/tradition-default-images";
import { getTraditionDefaultImage } from "@/lib/schools";

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
    tradition?: string;
  },
  traditionDefaults?: Record<string, string>,
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
  if (!photo || isGeneratedPlacePhoto(photo, place.photoSource)) {
    if (place.tradition != null) {
      const traditionDefault = traditionDefaults
        ? lookupTraditionDefaultImage(place.tradition, traditionDefaults)
        : getTraditionDefaultImage(place.tradition);
      if (traditionDefault) return [traditionDefault];
    }
    return [];
  }
  return [photo];
}

export function hasDisplayablePlacePhoto(
  place: {
    photo?: string | null;
    photoSource?: Place["photoSource"] | null;
    photos?: PlacePhoto[];
    tradition?: string;
  },
): boolean {
  return getPlaceDisplayPhotos(place).length > 0;
}

/** True when the location has its own uploaded photo (not a tradition placeholder). */
export function hasUploadedPlacePhoto(
  place: {
    photo?: string | null;
    photoSource?: Place["photoSource"] | null;
    photos?: PlacePhoto[];
  },
): boolean {
  const fromGallery = (place.photos ?? [])
    .filter(
      (entry) =>
        entry.path.trim() &&
        !isGeneratedPlacePhoto(entry.path, entry.photoSource ?? place.photoSource),
    )
    .map((entry) => entry.path.trim());

  if (fromGallery.length > 0) return true;

  const photo = place.photo?.trim();
  return Boolean(photo && !isGeneratedPlacePhoto(photo, place.photoSource));
}
