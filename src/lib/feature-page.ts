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

  for (const slug of FEATURED_LUMINARY_SLUGS) {
    const teacher = bySlug.get(slug);
    if (!teacher) continue;
    tryAdd(teacher, true);
    if (picked.length >= limit) return picked;
  }

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

const FEATURED_PLACE_TYPES = new Set(["Monastery", "Temple", "Center"]);

function hasPhoto(place: PlaceMarker): boolean {
  return Boolean(place.photo?.trim());
}

export function getFeaturedPlaces(
  places: PlaceMarker[],
  limit = 6,
): PlaceMarker[] {
  const candidates = places
    .filter(
      (place) =>
        FEATURED_PLACE_TYPES.has(place.type) && place.name.trim().length > 0,
    )
    .sort((a, b) => {
      const photoScore = Number(hasPhoto(b)) - Number(hasPhoto(a));
      if (photoScore !== 0) return photoScore;
      return a.name.localeCompare(b.name);
    });

  if (candidates.length <= limit) return candidates;

  const picked: PlaceMarker[] = [];
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
