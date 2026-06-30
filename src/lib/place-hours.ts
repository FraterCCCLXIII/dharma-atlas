import type { Place, PlaceOpeningHours } from "@/types/place";

export function formatPlaceOpeningHours(hours: PlaceOpeningHours | undefined): string[] {
  if (!hours?.weekdayDescriptions?.length) return [];
  return hours.weekdayDescriptions.filter((line) => line.trim().length > 0);
}

export function hasPlaceOpeningHours(place: Place): boolean {
  return formatPlaceOpeningHours(place.openingHours).length > 0;
}

export function placeHoursOpenNow(place: Place): boolean | undefined {
  return place.openingHours?.openNow;
}
