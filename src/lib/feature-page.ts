import type { Place } from "@/types/place";
import type { Teacher } from "@/types/teacher";

export interface DirectoryStats {
  placeCount: number;
  teacherCount: number;
  traditionCount: number;
}

export function getDirectoryStats(
  places: Place[],
  teachers: Teacher[],
): DirectoryStats {
  const traditions = new Set([
    ...places.map((place) => place.tradition),
    ...teachers.map((teacher) => teacher.tradition),
  ]);

  return {
    placeCount: places.length,
    teacherCount: teachers.length,
    traditionCount: traditions.size,
  };
}

export function getTopTraditions(
  places: Place[],
  teachers: Teacher[],
  limit = 8,
): string[] {
  const counts = new Map<string, number>();

  for (const place of places) {
    counts.set(place.tradition, (counts.get(place.tradition) ?? 0) + 1);
  }
  for (const teacher of teachers) {
    counts.set(teacher.tradition, (counts.get(teacher.tradition) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tradition]) => tradition);
}

export function getFeaturedTeachers(
  teachers: Teacher[],
  limit = 6,
): Teacher[] {
  const withPhoto = teachers.filter((teacher) => teacher.photo);
  const picked: Teacher[] = [];
  const seenTraditions = new Set<string>();

  for (const teacher of withPhoto) {
    if (seenTraditions.has(teacher.tradition)) continue;
    seenTraditions.add(teacher.tradition);
    picked.push(teacher);
    if (picked.length >= limit) return picked;
  }

  for (const teacher of withPhoto) {
    if (picked.some((entry) => entry.slug === teacher.slug)) continue;
    picked.push(teacher);
    if (picked.length >= limit) return picked;
  }

  return picked;
}

const FEATURED_PLACE_TYPES = new Set(["Monastery", "Temple", "Center"]);

function hasPhoto(place: Place): boolean {
  return Boolean(place.photo?.trim()) || (place.photos?.length ?? 0) > 0;
}

export function getFeaturedPlaces(places: Place[], limit = 6): Place[] {
  const candidates = places
    .filter(
      (place) =>
        FEATURED_PLACE_TYPES.has(place.type) &&
        place.name.trim().length > 0 &&
        !place.isDraft,
    )
    .sort((a, b) => {
      const photoScore = Number(hasPhoto(b)) - Number(hasPhoto(a));
      if (photoScore !== 0) return photoScore;
      return a.name.localeCompare(b.name);
    });

  if (candidates.length <= limit) return candidates;

  const picked: Place[] = [];
  const seenTraditions = new Set<string>();
  for (const place of candidates) {
    if (seenTraditions.has(place.tradition)) continue;
    seenTraditions.add(place.tradition);
    picked.push(place);
    if (picked.length >= limit) return picked;
  }

  for (const place of candidates) {
    if (picked.some((entry) => entry.id === place.id)) continue;
    picked.push(place);
    if (picked.length >= limit) return picked;
  }

  return picked;
}
