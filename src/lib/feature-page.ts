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

const US_BOUNDS = {
  minLat: 24,
  maxLat: 50,
  minLng: -125,
  maxLng: -66,
};

const FEATURED_PLACE_TYPES = new Set(["Monastery", "Temple", "Center"]);

export function getFeaturedPlaces(places: Place[], limit = 6): Place[] {
  const candidates = places
    .filter(
      (place) =>
        place.lat >= US_BOUNDS.minLat &&
        place.lat <= US_BOUNDS.maxLat &&
        place.lng >= US_BOUNDS.minLng &&
        place.lng <= US_BOUNDS.maxLng &&
        FEATURED_PLACE_TYPES.has(place.type) &&
        place.name.trim().length > 0,
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  if (candidates.length <= limit) return candidates;

  const step = Math.floor(candidates.length / limit);
  return Array.from({ length: limit }, (_, index) => candidates[index * step]);
}
