import { filterPlaces, type PlaceFilters } from "@/lib/places";
import { filterTeachers, type TeacherFilters } from "@/lib/teachers";
import type { Place } from "@/types/place";
import type { Teacher } from "@/types/teacher";
import type { EntityFilter } from "@/store/explore-store";

export type DirectoryEntry =
  | { kind: "place"; id: string; data: Place }
  | { kind: "teacher"; id: string; data: Teacher };

export function buildDirectoryEntries(
  places: Place[],
  teachers: Teacher[],
  entityFilter: EntityFilter,
  placeFilters: PlaceFilters,
  teacherFilters: TeacherFilters,
): DirectoryEntry[] {
  const filteredPlaces = filterPlaces(places, placeFilters);
  const filteredTeachers = filterTeachers(teachers, teacherFilters);

  if (entityFilter === "locations") {
    return filteredPlaces.map((place) => ({
      kind: "place" as const,
      id: place.id,
      data: place,
    }));
  }

  if (entityFilter === "people") {
    return filteredTeachers.map((teacher) => ({
      kind: "teacher" as const,
      id: teacher.slug,
      data: teacher,
    }));
  }

  const placeEntries: DirectoryEntry[] = filteredPlaces.map((place) => ({
    kind: "place",
    id: place.id,
    data: place,
  }));
  const teacherEntries: DirectoryEntry[] = filteredTeachers.map((teacher) => ({
    kind: "teacher",
    id: teacher.slug,
    data: teacher,
  }));

  return [...placeEntries, ...teacherEntries].sort((a, b) =>
    getEntryName(a).localeCompare(getEntryName(b)),
  );
}

function getEntryName(entry: DirectoryEntry): string {
  return entry.kind === "place" ? entry.data.name : entry.data.name;
}

export function countDirectoryResults(
  places: Place[],
  teachers: Teacher[],
  entityFilter: EntityFilter,
  placeFilters: PlaceFilters,
  teacherFilters: TeacherFilters,
): { resultCount: number; totalCount: number } {
  const filteredPlaces = filterPlaces(places, placeFilters);
  const filteredTeachers = filterTeachers(teachers, teacherFilters);

  if (entityFilter === "locations") {
    return { resultCount: filteredPlaces.length, totalCount: places.length };
  }
  if (entityFilter === "people") {
    return { resultCount: filteredTeachers.length, totalCount: teachers.length };
  }
  return {
    resultCount: filteredPlaces.length + filteredTeachers.length,
    totalCount: places.length + teachers.length,
  };
}
