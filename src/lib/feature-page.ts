import { FEATURED_LUMINARY_SLUGS } from "@/lib/luminaries";
import {
  getActiveOntologySnapshot,
  isBuddhistTeacherTradition,
} from "@/lib/schools";
import { getTeacherBrowseGroupId } from "@/lib/teacher-groups";
import { classifyTeacherLifeEra } from "@/lib/teacher-life-era";
import type { PlaceMarker } from "@/types/place";
import type { Teacher } from "@/types/teacher";

export interface DirectoryStats {
  placeCount: number;
  teacherCount: number;
  traditionCount: number;
}

export function getDirectoryStats(
  places: PlaceMarker[],
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
  places: PlaceMarker[],
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

function isBuddhistLineageTeacher(teacher: Teacher): boolean {
  if (isBuddhistTeacherTradition(teacher.tradition)) return true;
  return getActiveOntologySnapshot().lineageSchools.some(
    (school) => school.id === teacher.tradition,
  );
}

/** Living Buddhist teachers mixed across lineage schools for the home feature rail. */
export function getFeaturedTeachers(
  teachers: Teacher[],
  limit = 6,
): Teacher[] {
  const candidates = teachers.filter(
    (teacher) =>
      Boolean(teacher.photo) &&
      !teacher.isDraft &&
      classifyTeacherLifeEra(teacher) === "living" &&
      isBuddhistLineageTeacher(teacher),
  );

  const bySlug = new Map(candidates.map((teacher) => [teacher.slug, teacher]));
  const picked: Teacher[] = [];
  const seenSlugs = new Set<string>();
  const seenGroups = new Set<string>();

  const tryAdd = (teacher: Teacher, requireNewGroup: boolean) => {
    if (seenSlugs.has(teacher.slug)) return false;
    const groupId = getTeacherBrowseGroupId(teacher);
    if (requireNewGroup && seenGroups.has(groupId)) return false;
    seenSlugs.add(teacher.slug);
    seenGroups.add(groupId);
    picked.push(teacher);
    return true;
  };

  // Curated luminaries in list order (living Buddhists only via candidates filter).
  for (const slug of FEATURED_LUMINARY_SLUGS) {
    const teacher = bySlug.get(slug);
    if (!teacher) continue;
    tryAdd(teacher, false);
    if (picked.length >= limit) return picked;
  }

  // Fallback: diversify across lineage schools, then fill any remaining slots.
  const byGroupThenName = [...candidates].sort((a, b) => {
    const groupDelta =
      getTeacherBrowseGroupId(a).localeCompare(getTeacherBrowseGroupId(b), "en") ||
      a.name.localeCompare(b.name, "en");
    return groupDelta;
  });

  for (const teacher of byGroupThenName) {
    tryAdd(teacher, true);
    if (picked.length >= limit) return picked;
  }

  for (const teacher of byGroupThenName) {
    tryAdd(teacher, false);
    if (picked.length >= limit) return picked;
  }

  return picked;
}

const FEATURED_PLACE_TYPES = new Set([
  "Monastery",
  "Temple",
  "Center",
  "Meditation Center",
]);

/** Well-known, photogenic places shown in homepage "Places worth visiting". */
export const FEATURED_PLACE_IDS = [
  "8ae85e50e1c0", // Hsi Lai Temple (Hacienda Heights)
  "1ffecc1b7661", // Wat Mahadhatu (Bangkok)
  "53256afda8fc", // Amitabha Stupa and Peace Park (Sedona)
  "5010a44bf25a", // Mosteiro Zen Morro da Vargem (Brazil)
  "7dcfe2dc1170", // Buddhapadipa Temple (London)
  "6096f9afee91", // Sakya Tashi Ling (Catalonia)
  "ea658fbd909f", // Chuang Yen Monastery (New York)
  "52b6be42d19d", // Datsan Gunzechoyney (Saint Petersburg)
  "baeb4e897a7b", // Kwan Im Thong Hood Cho Temple (Singapore)
  "4b5ac226de01", // Deer Park Monastery (Escondido)
  "92a7427d3431", // Green Gulch Farm Zen Center
  "12fb0ee28231", // Spirit Rock Meditation Center
] as const;

function hasPhoto(place: PlaceMarker): boolean {
  return Boolean(place.photo?.trim());
}

function isEligibleFeaturedPlace(place: PlaceMarker): boolean {
  return (
    FEATURED_PLACE_TYPES.has(place.type) &&
    place.name.trim().length > 0 &&
    hasPhoto(place)
  );
}

export function getFeaturedPlaces(
  places: PlaceMarker[],
  limit = 6,
): PlaceMarker[] {
  const byId = new Map(places.map((place) => [place.id, place]));
  const picked: PlaceMarker[] = [];
  const seenIds = new Set<string>();

  for (const id of FEATURED_PLACE_IDS) {
    const place = byId.get(id);
    if (!place || !isEligibleFeaturedPlace(place) || seenIds.has(place.id)) {
      continue;
    }
    seenIds.add(place.id);
    picked.push(place);
    if (picked.length >= limit) return picked;
  }

  const fallback = places
    .filter(
      (place) => isEligibleFeaturedPlace(place) && !seenIds.has(place.id),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  const seenTraditions = new Set(picked.map((place) => place.tradition));
  for (const place of fallback) {
    if (seenTraditions.has(place.tradition)) continue;
    seenTraditions.add(place.tradition);
    seenIds.add(place.id);
    picked.push(place);
    if (picked.length >= limit) return picked;
  }

  for (const place of fallback) {
    if (seenIds.has(place.id)) continue;
    picked.push(place);
    if (picked.length >= limit) return picked;
  }

  return picked;
}
