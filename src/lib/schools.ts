import type { Place } from "@/types/place";
import type { LineageSchoolDef, OntologySnapshot } from "@/types/ontology";
import { DEFAULT_ONTOLOGY_SNAPSHOT } from "@/lib/ontology/defaults";

export type { LineageSchoolDef } from "@/types/ontology";

export type EntityScope = "all" | "locations" | "people";

let activeSnapshot: OntologySnapshot = DEFAULT_ONTOLOGY_SNAPSHOT;

export function setOntologySnapshot(snapshot: OntologySnapshot) {
  activeSnapshot = snapshot;
}

export function getActiveOntologySnapshot(): OntologySnapshot {
  return activeSnapshot;
}

function getLineageSchools(): LineageSchoolDef[] {
  return activeSnapshot.lineageSchools;
}

function getSubschoolRules() {
  return activeSnapshot.subschoolRules;
}

function getSubschoolLabels() {
  return activeSnapshot.subschoolLabels;
}

function getBuddhistPlaceTraditions() {
  return activeSnapshot.buddhistPlaceTraditions;
}

function getOtherTraditionDefs() {
  return activeSnapshot.otherTraditions;
}

/** Root Buddhist tradition id stored in filters and place/teacher data. */
export const BUDDHIST_TRADITION_ID = DEFAULT_ONTOLOGY_SNAPSHOT.buddhistRoot.filterId;

/** Display label for the Buddhist root tradition filter. */
export const BUDDHIST_TRADITION_LABEL = DEFAULT_ONTOLOGY_SNAPSHOT.buddhistRoot.label;

export type TraditionFilterGroup = {
  tradition: string;
  schools: string[];
};

export type LineageSchoolNode = {
  id: string;
  label: string;
  subschools: string[];
};

export type LineageFilterTree = {
  buddhism: {
    id: string;
    label: string;
    schools: LineageSchoolNode[];
  };
  otherTraditions: { id: string; label: string }[];
};

function getLineageSchoolById(id: string): LineageSchoolDef | undefined {
  return getLineageSchools().find((school) => school.id === id);
}

export function getSubschoolLabelMap(): Record<string, string> {
  return getSubschoolLabels();
}

export function getBuddhistPlaceTraditionOptions(): string[] {
  return getBuddhistPlaceTraditions();
}

export function subschoolLabel(slug: string): string {
  return getSubschoolLabels()[slug] ?? slug;
}

/** @deprecated Use subschoolLabel */
export function schoolLabel(slug: string): string {
  return subschoolLabel(slug);
}

export function isBuddhistPlaceTradition(tradition: string): boolean {
  return getBuddhistPlaceTraditions().includes(tradition);
}

export function isBuddhistTeacherTradition(tradition: string): boolean {
  return tradition === BUDDHIST_TRADITION_ID;
}

export function getSubschoolSlugsForLineageSchool(schoolSlug: string): string[] {
  return getSubschoolRules().filter((rule) => rule.lineageSchool === schoolSlug).map(
    (rule) => rule.slug,
  );
}

export function getSubschoolSlugsForLineageSchoolId(schoolId: string): string[] {
  const school = getLineageSchoolById(schoolId);
  if (!school) return [];
  return getSubschoolSlugsForLineageSchool(school.slug);
}

/** @deprecated Use getSubschoolSlugsForLineageSchoolId */
export function getSchoolSlugsForTradition(tradition: string): string[] {
  if (tradition === BUDDHIST_TRADITION_ID) {
    return getSubschoolRules().map((rule) => rule.slug);
  }
  return getSubschoolSlugsForLineageSchoolId(tradition);
}

export type LineageFilterState = {
  traditions: string[];
  schools: string[];
};

function getLineageSchoolIds() {
  return getLineageSchools().map((school) => school.id);
}

function otherTraditions(state: LineageFilterState): string[] {
  const lineageSchoolIds = getLineageSchoolIds();
  return state.traditions.filter(
    (tradition) =>
      tradition !== BUDDHIST_TRADITION_ID && !lineageSchoolIds.includes(tradition),
  );
}

export function isBuddhismRootSelected(state: LineageFilterState): boolean {
  return state.traditions.includes(BUDDHIST_TRADITION_ID);
}

export function getSubschoolParentSchoolId(subschool: string): string | null {
  const rule = getSubschoolRules().find((entry) => entry.slug === subschool);
  if (!rule) return null;

  const school = getLineageSchools().find((entry) => entry.slug === rule.lineageSchool);
  return school?.id ?? null;
}

export function isLineageSchoolVisuallyActive(
  state: LineageFilterState,
  schoolId: string,
): boolean {
  if (isBuddhismRootSelected(state)) return true;
  return state.traditions.includes(schoolId);
}

export function isSubschoolVisuallyActive(
  state: LineageFilterState,
  subschool: string,
): boolean {
  if (isBuddhismRootSelected(state)) return true;

  const parentSchoolId = getSubschoolParentSchoolId(subschool);
  if (parentSchoolId && state.traditions.includes(parentSchoolId)) return true;

  return state.schools.includes(subschool);
}

export function toggleBuddhismRoot(state: LineageFilterState): LineageFilterState {
  if (isBuddhismRootSelected(state)) {
    return {
      traditions: otherTraditions(state),
      schools: state.schools,
    };
  }

  return {
    traditions: [...otherTraditions(state), BUDDHIST_TRADITION_ID],
    schools: [],
  };
}

export function toggleLineageSchoolSelection(
  state: LineageFilterState,
  schoolId: string,
): LineageFilterState {
  const preserved = otherTraditions(state);
  const selectedSchools = state.traditions.filter((tradition) =>
    getLineageSchoolIds().includes(tradition),
  );

  if (isBuddhismRootSelected(state)) {
    return {
      traditions: [...preserved, schoolId],
      schools: [],
    };
  }

  if (state.traditions.includes(schoolId)) {
    return {
      traditions: [...preserved, ...selectedSchools.filter((id) => id !== schoolId)],
      schools: state.schools.filter(
        (subschool) => getSubschoolParentSchoolId(subschool) !== schoolId,
      ),
    };
  }

  return {
    traditions: [...preserved, ...selectedSchools, schoolId],
    schools: [],
  };
}

export function toggleSubschoolSelection(
  state: LineageFilterState,
  subschool: string,
): LineageFilterState {
  const preserved = otherTraditions(state);
  const parentSchoolId = getSubschoolParentSchoolId(subschool);
  const inheritedFromParent =
    isBuddhismRootSelected(state) ||
    (parentSchoolId != null && state.traditions.includes(parentSchoolId));

  if (inheritedFromParent) {
    return {
      traditions: preserved,
      schools: [subschool],
    };
  }

  if (state.schools.includes(subschool)) {
    return {
      traditions: state.traditions,
      schools: state.schools.filter((slug) => slug !== subschool),
    };
  }

  return {
    traditions: preserved,
    schools: [...state.schools, subschool],
  };
}

export function countLineageFilterSelections(state: LineageFilterState): number {
  if (isBuddhismRootSelected(state)) return 1;

  const selectedSchools = state.traditions.filter((tradition) =>
    getLineageSchoolIds().includes(tradition),
  ).length;
  const otherSelectedTraditions = otherTraditions(state).length;

  if (selectedSchools > 0 || state.schools.length > 0) {
    return selectedSchools + state.schools.length + otherSelectedTraditions;
  }

  return otherSelectedTraditions;
}

function placeMatchesLineageSchool(
  place: Pick<Place, "name" | "tradition" | "schools">,
  school: LineageSchoolDef,
): boolean {
  if (school.placeTraditions.includes(place.tradition)) return true;

  const subschools = getSchools(place);
  const schoolSubschools = getSubschoolSlugsForLineageSchool(school.slug);
  return subschools.some((subschool) => schoolSubschools.includes(subschool));
}

export function placeMatchesTraditionFilter(
  place: Pick<Place, "name" | "tradition" | "schools">,
  tradition: string,
): boolean {
  if (tradition === BUDDHIST_TRADITION_ID) {
    return isBuddhistPlaceTradition(place.tradition);
  }

  const lineageSchool = getLineageSchoolById(tradition);
  if (lineageSchool) {
    return placeMatchesLineageSchool(place, lineageSchool);
  }

  return place.tradition === tradition;
}

/** Infer subschools from the place name only (folder names are too broad to use). */
export function inferSchools(place: Pick<Place, "name" | "tradition">): string[] {
  const subschools = new Set<string>();

  for (const rule of getSubschoolRules()) {
    if (!rule.placeTraditions.includes(place.tradition)) continue;
    if (rule.pattern.test(place.name)) subschools.add(rule.slug);
  }

  return [...subschools].sort((a, b) => subschoolLabel(a).localeCompare(subschoolLabel(b)));
}

/** Manual subschools from places.json merged with name-based inference. */
export function getSchools(place: Pick<Place, "name" | "tradition" | "schools">): string[] {
  const subschools = new Set<string>(place.schools ?? []);

  for (const subschool of inferSchools(place)) {
    subschools.add(subschool);
  }

  return [...subschools].sort((a, b) => subschoolLabel(a).localeCompare(subschoolLabel(b)));
}

export function getSchoolsForPlaces(places: Place[]): string[] {
  const subschools = new Set<string>();
  for (const place of places) {
    for (const subschool of getSchools(place)) subschools.add(subschool);
  }
  return [...subschools].sort((a, b) => subschoolLabel(a).localeCompare(subschoolLabel(b)));
}

type TeacherSchoolFields = {
  name: string;
  tradition: string;
  lineage: string;
  shortBio: string;
  topics: string[];
  biography?: string[];
};

function normalizeForMatch(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function teacherHaystack(teacher: TeacherSchoolFields): string {
  return [
    teacher.name,
    teacher.lineage,
    teacher.shortBio,
    ...teacher.topics,
    ...(teacher.biography ?? []),
  ].join(" ");
}

/** Infer subschool slugs from teacher text fields. */
export function inferTeacherSchools(teacher: TeacherSchoolFields): string[] {
  const haystack = teacherHaystack(teacher);
  const subschools = new Set<string>();

  for (const rule of getSubschoolRules()) {
    if (rule.pattern.test(haystack)) subschools.add(rule.slug);
  }

  return [...subschools].sort((a, b) => subschoolLabel(a).localeCompare(subschoolLabel(b)));
}

function sortLineageSchoolIds(ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const aLabel = getLineageSchoolById(a)?.label ?? a;
    const bLabel = getLineageSchoolById(b)?.label ?? b;
    return aLabel.localeCompare(bLabel);
  });
}

/** Infer major school ids (Theravada, Zen, Tibetan, …) from teacher text fields. */
export function inferTeacherLineageSchoolIds(teacher: TeacherSchoolFields): string[] {
  const haystack = normalizeForMatch(teacherHaystack(teacher));
  const fromLabels = new Set<string>();

  for (const school of getLineageSchools()) {
    if (haystack.includes(normalizeForMatch(school.label))) {
      fromLabels.add(school.id);
    }
  }

  if (fromLabels.size > 0) {
    return sortLineageSchoolIds([...fromLabels]);
  }

  const fromSubschools = new Set<string>();
  for (const subschool of inferTeacherSchools(teacher)) {
    const parentId = getSubschoolParentSchoolId(subschool);
    if (parentId) fromSubschools.add(parentId);
  }

  return sortLineageSchoolIds([...fromSubschools]);
}

/** Card label: major school(s), optionally with inferred subschools when not compact. */
export function formatTeacherSchoolLine(
  teacher: TeacherSchoolFields,
  compact = false,
): string {
  const directSchool = getLineageSchoolById(teacher.tradition);
  if (directSchool) {
    const subschools = inferTeacherSchools(teacher);
    if (!compact && subschools.length) {
      return `${directSchool.label} · ${subschools.map(subschoolLabel).join(" · ")}`;
    }
    return directSchool.label;
  }

  if (!isBuddhistTeacherTradition(teacher.tradition)) {
    return teacher.tradition;
  }

  const lineageSchoolIds = inferTeacherLineageSchoolIds(teacher);
  const subschools = inferTeacherSchools(teacher);

  if (lineageSchoolIds.length) {
    const schools = lineageSchoolIds
      .map((id) => getLineageSchoolById(id)?.label ?? id)
      .join(" · ");
    if (!compact && subschools.length) {
      return `${schools} · ${subschools.map(subschoolLabel).join(" · ")}`;
    }
    return schools;
  }

  if (subschools.length) {
    return subschools.map(subschoolLabel).join(" · ");
  }

  if (teacher.lineage.trim()) {
    return teacher.lineage;
  }

  return teacher.tradition;
}

function teacherMatchesLineageSchool(
  teacher: TeacherSchoolFields,
  school: LineageSchoolDef,
): boolean {
  const haystack = teacherHaystack(teacher).toLowerCase();
  if (haystack.includes(school.label.toLowerCase())) return true;

  const schoolSubschools = getSubschoolSlugsForLineageSchool(school.slug);
  const teacherSubschools = inferTeacherSchools(teacher);
  return teacherSubschools.some((subschool) => schoolSubschools.includes(subschool));
}

export function teacherMatchesTradition(
  teacher: TeacherSchoolFields,
  tradition: string,
): boolean {
  if (teacher.tradition === tradition) return true;

  if (tradition === BUDDHIST_TRADITION_ID) {
    return (
      isBuddhistTeacherTradition(teacher.tradition) ||
      inferTeacherSchools(teacher).length > 0
    );
  }

  const lineageSchool = getLineageSchoolById(tradition);
  if (lineageSchool) {
    return teacherMatchesLineageSchool(teacher, lineageSchool);
  }

  return false;
}

function addSubschoolToLineageSchool(
  bySchool: Map<string, Set<string>>,
  schoolSlug: string,
  subschool: string,
) {
  const set = bySchool.get(schoolSlug) ?? new Set<string>();
  set.add(subschool);
  bySchool.set(schoolSlug, set);
}

function buildLineageSchoolNodes(
  places: Place[],
  teachers: TeacherSchoolFields[],
  includePlaces: boolean,
  includeTeachers: boolean,
): LineageSchoolNode[] {
  const subschoolsBySchool = new Map<string, Set<string>>();
  const schoolHasEntities = new Set<string>();

  if (includePlaces) {
    for (const place of places) {
      for (const school of getLineageSchools()) {
        if (placeMatchesLineageSchool(place, school)) {
          schoolHasEntities.add(school.slug);
        }
      }

      for (const subschool of getSchools(place)) {
        const rule = getSubschoolRules().find((entry) => entry.slug === subschool);
        if (rule) {
          schoolHasEntities.add(rule.lineageSchool);
          addSubschoolToLineageSchool(subschoolsBySchool, rule.lineageSchool, subschool);
        }
      }
    }
  }

  if (includeTeachers) {
    for (const teacher of teachers) {
      if (
        isBuddhistTeacherTradition(teacher.tradition) ||
        inferTeacherSchools(teacher).length > 0
      ) {
        for (const school of getLineageSchools()) {
          if (teacherMatchesLineageSchool(teacher, school)) {
            schoolHasEntities.add(school.slug);
          }
        }
      }

      for (const subschool of inferTeacherSchools(teacher)) {
        const rule = getSubschoolRules().find((entry) => entry.slug === subschool);
        if (rule) {
          schoolHasEntities.add(rule.lineageSchool);
          addSubschoolToLineageSchool(subschoolsBySchool, rule.lineageSchool, subschool);
        }
      }
    }
  }

  return getLineageSchools().filter((school) => schoolHasEntities.has(school.slug)).map(
    (school) => ({
      id: school.id,
      label: school.label,
      subschools: [...(subschoolsBySchool.get(school.slug) ?? [])].sort((a, b) =>
        subschoolLabel(a).localeCompare(subschoolLabel(b)),
      ),
    }),
  );
}

export function getLineageFilterTree(
  places: Place[],
  teachers: TeacherSchoolFields[],
  entityFilter: EntityScope,
): LineageFilterTree {
  const includePlaces = entityFilter !== "people";
  const includeTeachers = entityFilter !== "locations";

  const buddhistPlaces = includePlaces
    ? places.filter((place) => isBuddhistPlaceTradition(place.tradition))
    : [];

  const schools = buildLineageSchoolNodes(
    buddhistPlaces,
    includeTeachers ? teachers : [],
    includePlaces,
    includeTeachers,
  );

  const otherTraditionIds = new Set<string>(
    getOtherTraditionDefs().map((tradition) => tradition.filterId),
  );

  if (includeTeachers) {
    for (const teacher of teachers) {
      if (!isBuddhistTeacherTradition(teacher.tradition)) {
        otherTraditionIds.add(teacher.tradition);
      }
    }
  }

  if (includePlaces) {
    for (const place of places) {
      if (!isBuddhistPlaceTradition(place.tradition)) {
        otherTraditionIds.add(place.tradition);
      }
    }
  }

  const otherTraditionLabels = new Map(
    getOtherTraditionDefs().map((tradition) => [tradition.filterId, tradition.label]),
  );

  return {
    buddhism: {
      id: activeSnapshot.buddhistRoot.filterId,
      label: activeSnapshot.buddhistRoot.label,
      schools,
    },
    otherTraditions: [...otherTraditionIds]
      .sort((a, b) => a.localeCompare(b))
      .map((id) => ({ id, label: otherTraditionLabels.get(id) ?? id })),
  };
}

/** @deprecated Use getLineageFilterTree */
export function getTraditionFilterGroups(
  places: Place[],
  teachers: TeacherSchoolFields[],
  entityFilter: EntityScope,
  selectedTraditions: string[],
): TraditionFilterGroup[] {
  const tree = getLineageFilterTree(places, teachers, entityFilter);
  return tree.buddhism.schools.map((school) => ({
    tradition: school.id,
    schools: school.subschools,
  }));
}

/** @deprecated Use getLineageFilterTree */
export function getSchoolOptions(
  places: Place[],
  selectedTraditions: string[],
): TraditionFilterGroup[] {
  return getTraditionFilterGroups(places, [], "locations", selectedTraditions);
}
