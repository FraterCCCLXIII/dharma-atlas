import {
  BUDDHIST_TRADITION_LABEL,
  getActiveOntologySnapshot,
  inferTeacherLineageSchoolIds,
  isBuddhistTeacherTradition,
} from "@/lib/schools";
import type { Teacher } from "@/types/teacher";

export type PeopleSortOrder = "alphabetical" | "tradition-school";

export type TeacherGroup = {
  id: string;
  title: string;
  sortOrder: number;
  teachers: Teacher[];
};

const UNCLASSIFIED_BUDDHIST_GROUP_ID = "buddhist-unclassified";

function lineageSchoolOrder(): Map<string, number> {
  return new Map(
    getActiveOntologySnapshot().lineageSchools.map((school, index) => [
      school.id,
      index,
    ]),
  );
}

function otherTraditionSortOrder(traditionId: string): number {
  const lineageCount = getActiveOntologySnapshot().lineageSchools.length;
  const otherDefs = getActiveOntologySnapshot().otherTraditions;
  const index = otherDefs.findIndex((entry) => entry.filterId === traditionId);
  return lineageCount + (index >= 0 ? index : otherDefs.length + 1);
}

function resolveTeacherGroup(teacher: Teacher): {
  id: string;
  title: string;
  sortOrder: number;
} {
  const snapshot = getActiveOntologySnapshot();
  const directSchool = snapshot.lineageSchools.find(
    (school) => school.id === teacher.tradition,
  );
  if (directSchool) {
    return {
      id: directSchool.id,
      title: `${BUDDHIST_TRADITION_LABEL} · ${directSchool.label}`,
      sortOrder: lineageSchoolOrder().get(directSchool.id) ?? 0,
    };
  }

  if (!isBuddhistTeacherTradition(teacher.tradition)) {
    const otherDef = snapshot.otherTraditions.find(
      (entry) => entry.filterId === teacher.tradition,
    );
    return {
      id: teacher.tradition,
      title: otherDef?.label ?? teacher.tradition,
      sortOrder: otherTraditionSortOrder(teacher.tradition),
    };
  }

  const schoolIds = inferTeacherLineageSchoolIds(teacher);
  if (schoolIds.length > 0) {
    const schoolId = schoolIds[0];
    const school = snapshot.lineageSchools.find((entry) => entry.id === schoolId);
    const schoolLabel = school?.label ?? schoolId;
    return {
      id: schoolId,
      title: `${BUDDHIST_TRADITION_LABEL} · ${schoolLabel}`,
      sortOrder: lineageSchoolOrder().get(schoolId) ?? 0,
    };
  }

  return {
    id: UNCLASSIFIED_BUDDHIST_GROUP_ID,
    title: BUDDHIST_TRADITION_LABEL,
    sortOrder: snapshot.lineageSchools.length,
  };
}

export function getTeacherBrowseGroupId(teacher: Teacher): string {
  return resolveTeacherGroup(teacher).id;
}

export function sortTeachersAlphabetically(teachers: Teacher[]): Teacher[] {
  return [...teachers].sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export function groupTeachersByTraditionAndSchool(
  teachers: Teacher[],
): TeacherGroup[] {
  const groups = new Map<string, TeacherGroup>();

  for (const teacher of teachers) {
    const { id, title, sortOrder } = resolveTeacherGroup(teacher);
    const existing = groups.get(id);
    if (existing) {
      existing.teachers.push(teacher);
      continue;
    }

    groups.set(id, { id, title, sortOrder, teachers: [teacher] });
  }

  for (const group of groups.values()) {
    group.teachers.sort((a, b) => a.name.localeCompare(b.name, "en"));
  }

  return [...groups.values()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "en"),
  );
}

export function isPeopleSortOrder(value: string): value is PeopleSortOrder {
  return value === "alphabetical" || value === "tradition-school";
}

export const PEOPLE_SORT_LABELS: Record<PeopleSortOrder, string> = {
  alphabetical: "Alphabetical",
  "tradition-school": "Tradition & school",
};
