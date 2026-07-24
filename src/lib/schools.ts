import type { Faith, Place } from "@/types/place";
import type { LineageSchoolDef, OntologySnapshot, PlaceTraditionPickerOption } from "@/types/ontology";
import { DEFAULT_ONTOLOGY_SNAPSHOT } from "@/lib/ontology/defaults";

export type { LineageSchoolDef, PlaceTraditionPickerOption } from "@/types/ontology";

export type EntityScope = "all" | "locations" | "people";

let activeSnapshot: OntologySnapshot = DEFAULT_ONTOLOGY_SNAPSHOT;

export function setOntologySnapshot(snapshot: OntologySnapshot) {
  activeSnapshot = snapshot;
}

export function getActiveOntologySnapshot(): OntologySnapshot {
  return activeSnapshot;
}

export function getTraditionDefaultImage(tradition: string): string | null {
  return activeSnapshot.traditionDefaultImages[tradition] ?? null;
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

/** Options for place tradition pickers, derived from the active ontology snapshot. */
export function getPlaceTraditionPickerOptions(
  faith?: string,
  includeValue?: string,
): PlaceTraditionPickerOption[] {
  const snapshot = getActiveOntologySnapshot();
  let options = snapshot.placeTraditionPickerOptions;

  if (faith === "Buddhist") {
    options = options.filter((option) => option.group === "Buddhist");
  } else if (faith === "Hindu") {
    options = options.filter((option) => option.group === "Other");
  }

  if (includeValue?.trim()) {
    const trimmed = includeValue.trim();
    if (!options.some((option) => option.value === trimmed)) {
      const group: PlaceTraditionPickerOption["group"] = isBuddhistPlaceTradition(trimmed)
        ? "Buddhist"
        : "Other";
      options = [...options, { value: trimmed, label: trimmed, group }];
    }
  }

  return options;
}

export function isKnownPlaceTradition(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return getActiveOntologySnapshot().placeTraditionPickerOptions.some(
    (option) => option.value === trimmed,
  );
}

/** Place listing lineage fields driven by the consolidated picker. */
export type PlaceLineageValue = {
  faith: Faith;
  tradition: string;
  schools: string[];
};

export type PlaceLineagePickerOption = {
  /** Stable select value, e.g. `subschool:nyingma`. */
  key: string;
  kind: "buddhist_root" | "lineage" | "subschool" | "other";
  label: string;
  /** Indent depth for hierarchical select rendering. */
  depth: number;
  value: PlaceLineageValue;
};

export type PlaceLineageChip = {
  key: string;
  label: string;
};

/** Faith for non-Buddhist ontology roots (app only has Buddhist | Hindu). */
function faithForOtherTradition(filterId: string): Faith {
  return filterId === "Buddhist" ? "Buddhist" : "Hindu";
}

/** Full ontology tree for place lineage picking (not filtered by entity presence). */
export function getPlaceLineagePickerOptions(): PlaceLineagePickerOption[] {
  const snapshot = getActiveOntologySnapshot();
  const options: PlaceLineagePickerOption[] = [];

  options.push({
    key: `buddhist_root:${snapshot.buddhistRoot.filterId}`,
    kind: "buddhist_root",
    label: snapshot.buddhistRoot.label,
    depth: 0,
    value: {
      faith: "Buddhist",
      tradition: snapshot.buddhistRoot.filterId,
      schools: [],
    },
  });

  for (const school of snapshot.lineageSchools) {
    const tradition =
      school.placeTraditions[0]?.trim() || school.id || school.label;
    options.push({
      key: `lineage:${school.id}`,
      kind: "lineage",
      label: school.label,
      depth: 1,
      value: {
        faith: "Buddhist",
        tradition,
        schools: [],
      },
    });

    const subschools = getSubschoolSlugsForLineageSchool(school.slug).sort((a, b) =>
      subschoolLabel(a).localeCompare(subschoolLabel(b)),
    );
    for (const slug of subschools) {
      options.push({
        key: `subschool:${slug}`,
        kind: "subschool",
        label: subschoolLabel(slug),
        depth: 2,
        value: {
          faith: "Buddhist",
          tradition,
          schools: [slug],
        },
      });
    }
  }

  for (const other of snapshot.otherTraditions) {
    options.push({
      key: `other:${other.filterId}`,
      kind: "other",
      label: other.label,
      depth: 0,
      value: {
        faith: faithForOtherTradition(other.filterId),
        tradition: other.filterId,
        schools: [],
      },
    });
  }

  return options;
}

export type PlaceLineageSelectionChip = PlaceLineageChip & {
  /** Full upstream path label, e.g. "Buddhism › Tibetan › Nyingma". */
  pathLabel: string;
};

function lineageSchoolForTradition(tradition: string): LineageSchoolDef | undefined {
  const snapshot = getActiveOntologySnapshot();
  return (
    getLineageSchoolById(tradition) ??
    snapshot.lineageSchools.find((school) =>
      school.placeTraditions.some(
        (placeTradition) => placeTradition.toLowerCase() === tradition.toLowerCase(),
      ),
    )
  );
}

function pathLabelForKeys(keys: string[]): string {
  const options = getPlaceLineagePickerOptions();
  return keys
    .map((key) => options.find((option) => option.key === key)?.label ?? key)
    .join(" › ");
}

/**
 * One removable chip per selected leaf (subschool, lineage-only, other, or custom).
 * Upstream parents are included in the path label.
 */
export function getPlaceLineageSelectionChips(
  value: PlaceLineageValue,
): PlaceLineageSelectionChip[] {
  const snapshot = getActiveOntologySnapshot();
  const chips: PlaceLineageSelectionChip[] = [];
  const tradition = value.tradition.trim();
  const schools = [...new Set(value.schools ?? [])];
  const buddhistRootKey = `buddhist_root:${snapshot.buddhistRoot.filterId}`;

  for (const slug of schools) {
    const parentId = getSubschoolParentSchoolId(slug);
    const lineage = parentId ? getLineageSchoolById(parentId) : undefined;
    const keys = [buddhistRootKey];
    if (lineage) keys.push(`lineage:${lineage.id}`);
    keys.push(`subschool:${slug}`);
    chips.push({
      key: `subschool:${slug}`,
      label: subschoolLabel(slug),
      pathLabel: pathLabelForKeys(keys),
    });
  }

  const lineage = lineageSchoolForTradition(tradition);
  const schoolsCoverLineage =
    lineage &&
    schools.some((slug) => getSubschoolParentSchoolId(slug) === lineage.id);

  if (
    lineage &&
    !schoolsCoverLineage &&
    tradition &&
    tradition !== snapshot.buddhistRoot.filterId
  ) {
    const keys = [buddhistRootKey, `lineage:${lineage.id}`];
    chips.push({
      key: `lineage:${lineage.id}`,
      label: lineage.label,
      pathLabel: pathLabelForKeys(keys),
    });
  }

  if (
    tradition &&
    tradition !== snapshot.buddhistRoot.filterId &&
    !lineage &&
    schools.length === 0
  ) {
    const other = snapshot.otherTraditions.find((entry) => entry.filterId === tradition);
    chips.push({
      key: other ? `other:${other.filterId}` : `custom:${tradition}`,
      label: other?.label ?? tradition,
      pathLabel: other?.label ?? tradition,
    });
  }

  if (
    chips.length === 0 &&
    tradition === snapshot.buddhistRoot.filterId
  ) {
    chips.push({
      key: buddhistRootKey,
      label: snapshot.buddhistRoot.label,
      pathLabel: snapshot.buddhistRoot.label,
    });
  }

  return chips;
}

/** @deprecated Use getPlaceLineageSelectionChips */
export function getPlaceLineageChips(value: PlaceLineageValue): PlaceLineageChip[] {
  return getPlaceLineageSelectionChips(value).map(({ key, label }) => ({ key, label }));
}

/** Keys already represented in the current value (disabled in the add list). */
export function getSelectedPlaceLineageKeys(value: PlaceLineageValue): string[] {
  const snapshot = getActiveOntologySnapshot();
  const keys = new Set(getPlaceLineageSelectionChips(value).map((chip) => chip.key));

  for (const slug of value.schools ?? []) {
    keys.add(`subschool:${slug}`);
    const parentId = getSubschoolParentSchoolId(slug);
    if (parentId) keys.add(`lineage:${parentId}`);
    keys.add(`buddhist_root:${snapshot.buddhistRoot.filterId}`);
  }

  const lineage = lineageSchoolForTradition(value.tradition);
  if (lineage) {
    keys.add(`lineage:${lineage.id}`);
    keys.add(`buddhist_root:${snapshot.buddhistRoot.filterId}`);
  }

  if (value.tradition === snapshot.buddhistRoot.filterId) {
    keys.add(`buddhist_root:${snapshot.buddhistRoot.filterId}`);
  }

  return [...keys];
}

/** Merge a picker option into the current multi-selection. */
export function addPlaceLineageSelection(
  current: PlaceLineageValue,
  option: PlaceLineagePickerOption,
): PlaceLineageValue {
  const schools = new Set(current.schools ?? []);

  if (option.kind === "subschool") {
    for (const slug of option.value.schools) schools.add(slug);
    const nextTradition =
      current.tradition.trim() && current.tradition !== getActiveOntologySnapshot().buddhistRoot.filterId
        ? current.tradition
        : option.value.tradition;
    return {
      faith: "Buddhist",
      tradition: nextTradition || option.value.tradition,
      schools: [...schools].sort(),
    };
  }

  if (option.kind === "lineage") {
    // Already covered by a selected subschool under this lineage — no-op.
    const lineageId = option.key.replace(/^lineage:/, "");
    const covered = [...schools].some(
      (slug) => getSubschoolParentSchoolId(slug) === lineageId,
    );
    if (covered) return current;

    if (!current.tradition.trim() || current.tradition === getActiveOntologySnapshot().buddhistRoot.filterId) {
      return {
        faith: "Buddhist",
        tradition: option.value.tradition,
        schools: [...schools].sort(),
      };
    }

    // Keep primary tradition; lineage-only extras aren't stored beyond schools.
    // If primary was an other/custom, prefer Buddhist lineage as primary when adding one.
    if (!isBuddhistPlaceTradition(current.tradition) && current.faith !== "Buddhist") {
      return {
        faith: "Buddhist",
        tradition: option.value.tradition,
        schools: [...schools].sort(),
      };
    }

    return current;
  }

  if (option.kind === "buddhist_root") {
    if (current.tradition.trim() || schools.size > 0) return current;
    return option.value;
  }

  // other / treated as primary tradition when empty; otherwise ignore duplicate
  if (!current.tradition.trim() && schools.size === 0) {
    return option.value;
  }
  if (current.tradition === option.value.tradition) return current;
  // Second non-Buddhist tradition: keep schools, switch primary only if no Buddhist schools
  if (schools.size === 0 && !isBuddhistPlaceTradition(current.tradition)) {
    return option.value;
  }
  return current;
}

export function removePlaceLineageSelection(
  current: PlaceLineageValue,
  key: string,
): PlaceLineageValue {
  const snapshot = getActiveOntologySnapshot();

  if (key.startsWith("subschool:")) {
    const slug = key.slice("subschool:".length);
    const schools = (current.schools ?? []).filter((entry) => entry !== slug);
    if (schools.length > 0) {
      const parentId = getSubschoolParentSchoolId(schools[0]!);
      const lineage = parentId ? getLineageSchoolById(parentId) : undefined;
      return {
        faith: "Buddhist",
        tradition:
          lineage?.placeTraditions[0] ??
          lineage?.id ??
          current.tradition,
        schools,
      };
    }
    if (
      current.tradition &&
      current.tradition !== snapshot.buddhistRoot.filterId &&
      lineageSchoolForTradition(current.tradition)
    ) {
      return {
        faith: "Buddhist",
        tradition: current.tradition,
        schools: [],
      };
    }
    return { faith: current.faith, tradition: "", schools: [] };
  }

  if (key.startsWith("lineage:")) {
    const lineageId = key.slice("lineage:".length);
    const schools = (current.schools ?? []).filter(
      (slug) => getSubschoolParentSchoolId(slug) !== lineageId,
    );
    if (schools.length > 0) {
      const parentId = getSubschoolParentSchoolId(schools[0]!);
      const lineage = parentId ? getLineageSchoolById(parentId) : undefined;
      return {
        faith: "Buddhist",
        tradition: lineage?.placeTraditions[0] ?? lineage?.id ?? "Buddhist",
        schools,
      };
    }
    return { faith: current.faith, tradition: "", schools: [] };
  }

  if (key.startsWith("other:") || key.startsWith("custom:")) {
    return { faith: current.faith, tradition: "", schools: current.schools ?? [] };
  }

  if (key.startsWith("buddhist_root:")) {
    return { faith: "Buddhist", tradition: "", schools: [] };
  }

  return current;
}

export function addCustomPlaceLineageSelection(
  current: PlaceLineageValue,
  tradition: string,
): PlaceLineageValue {
  const trimmed = tradition.trim();
  if (!trimmed) return current;
  const next = placeLineageFromCustomTradition(trimmed, current.faith);
  if (!current.tradition.trim() && (current.schools ?? []).length === 0) {
    return next;
  }
  // Already have selections — custom becomes primary only when no schools yet
  if ((current.schools ?? []).length === 0 && !isBuddhistPlaceTradition(current.tradition)) {
    return next;
  }
  return current;
}

export function placeLineageFromCustomTradition(
  tradition: string,
  previousFaith: Faith = "Buddhist",
): PlaceLineageValue {
  const trimmed = tradition.trim();
  if (!trimmed) {
    return { faith: previousFaith, tradition: "", schools: [] };
  }
  if (isBuddhistPlaceTradition(trimmed)) {
    return { faith: "Buddhist", tradition: trimmed, schools: [] };
  }
  return {
    faith: faithForOtherTradition(trimmed),
    tradition: trimmed,
    schools: [],
  };
}

export type PlaceDisplayTag = {
  key: string;
  label: string;
  kind: "faith" | "lineage" | "school" | "type";
};

/**
 * Public place tags in ontology order:
 * faith → each lineage with its schools → other tradition → place type.
 * Example: Buddhist, Tibetan, Kagyu, Zen, Sanbo Zen, Center
 */
export function getPlaceDisplayTags(
  place: Pick<Place, "faith" | "tradition" | "schools" | "type" | "name">,
): PlaceDisplayTag[] {
  const tags: PlaceDisplayTag[] = [];
  const seen = new Set<string>();

  function push(key: string, label: string, kind: PlaceDisplayTag["kind"]) {
    if (!label.trim() || seen.has(key)) return;
    seen.add(key);
    tags.push({ key, label, kind });
  }

  if (place.faith) {
    push(`faith:${place.faith}`, place.faith, "faith");
  }

  const schoolSlugs = getSchools(place);
  const selectedLineageIds = new Set<string>();

  const traditionLineage = lineageSchoolForTradition(place.tradition);
  if (traditionLineage) selectedLineageIds.add(traditionLineage.id);

  for (const slug of schoolSlugs) {
    const parentId = getSubschoolParentSchoolId(slug);
    if (parentId) selectedLineageIds.add(parentId);
  }

  for (const lineage of getLineageSchools()) {
    if (!selectedLineageIds.has(lineage.id)) continue;
    push(`lineage:${lineage.id}`, lineage.label, "lineage");

    const childSchools = schoolSlugs
      .filter((slug) => getSubschoolParentSchoolId(slug) === lineage.id)
      .sort((a, b) => subschoolLabel(a).localeCompare(subschoolLabel(b)));

    for (const slug of childSchools) {
      push(`school:${slug}`, subschoolLabel(slug), "school");
    }
  }

  for (const slug of schoolSlugs) {
    push(`school:${slug}`, subschoolLabel(slug), "school");
  }

  if (
    place.tradition.trim() &&
    place.tradition !== BUDDHIST_TRADITION_ID &&
    !traditionLineage &&
    place.tradition !== place.faith
  ) {
    push(`tradition:${place.tradition}`, place.tradition, "lineage");
  }

  if (place.type) {
    push(`type:${place.type}`, place.type, "type");
  }

  return tags;
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

export function getSchoolsForPlaces(
  places: Pick<Place, "name" | "tradition" | "schools">[],
): string[] {
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

/** Name + lineage + topics only — bios often mention teachers/centers of other schools. */
function teacherClassificationHaystack(teacher: TeacherSchoolFields): string {
  return [teacher.name, teacher.lineage, ...teacher.topics].join(" ");
}

/** Infer subschool slugs from teacher text fields. */
export function inferTeacherSchools(teacher: TeacherSchoolFields): string[] {
  const haystack = teacherClassificationHaystack(teacher);
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
  const haystack = normalizeForMatch(teacherClassificationHaystack(teacher));
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
  const haystack = teacherClassificationHaystack(teacher).toLowerCase();
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
  places: Pick<Place, "name" | "tradition" | "schools">[],
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

/**
 * Full locations filter tree from ontology — does not require downloading every
 * place marker just to populate the sidebar.
 */
export function getLocationsLineageFilterTree(): LineageFilterTree {
  const schools = getLineageSchools().map((school) => ({
    id: school.id,
    label: school.label,
    subschools: getSubschoolRules()
      .filter((rule) => rule.lineageSchool === school.slug)
      .map((rule) => rule.slug)
      .sort((a, b) => subschoolLabel(a).localeCompare(subschoolLabel(b))),
  }));

  return {
    buddhism: {
      id: activeSnapshot.buddhistRoot.filterId,
      label: activeSnapshot.buddhistRoot.label,
      schools,
    },
    otherTraditions: getOtherTraditionDefs()
      .map((tradition) => ({
        id: tradition.filterId,
        label: tradition.label,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  };
}

export function getLineageFilterTree(
  places: Pick<Place, "name" | "tradition" | "schools">[],
  teachers: TeacherSchoolFields[],
  entityFilter: EntityScope,
): LineageFilterTree {
  if (entityFilter === "locations") {
    return getLocationsLineageFilterTree();
  }

  const includePlaces = entityFilter === "all";
  const includeTeachers = true;

  const buddhistPlaces = includePlaces
    ? places.filter((place) => isBuddhistPlaceTradition(place.tradition))
    : [];

  const schools = buildLineageSchoolNodes(
    buddhistPlaces,
    teachers,
    includePlaces,
    includeTeachers,
  );

  const otherTraditionLabels = new Map(
    getOtherTraditionDefs().map((tradition) => [tradition.filterId, tradition.label]),
  );
  // Legacy filter IDs that may still appear on records before migrations catch up.
  for (const [legacyId, label] of [
    ["Non-Dualism", "Nonduality"],
    ["Non-dualism", "Nonduality"],
    ["Contemplative Christian", "Contemplative Christianity"],
  ] as const) {
    if (!otherTraditionLabels.has(legacyId)) {
      otherTraditionLabels.set(legacyId, label);
    }
  }

  const canonicalOtherId = (tradition: string) => {
    if (tradition === "Non-Dualism" || tradition === "Non-dualism") {
      return otherTraditionLabels.has("Nonduality") ? "Nonduality" : tradition;
    }
    if (tradition === "Contemplative Christian") {
      return otherTraditionLabels.has("Contemplative Christianity")
        ? "Contemplative Christianity"
        : tradition;
    }
    return tradition;
  };

  const otherTraditionIds = new Set<string>(
    getOtherTraditionDefs().map((tradition) => tradition.filterId),
  );

  if (includeTeachers) {
    for (const teacher of teachers) {
      if (!isBuddhistTeacherTradition(teacher.tradition)) {
        otherTraditionIds.add(canonicalOtherId(teacher.tradition));
      }
    }
  }

  if (includePlaces) {
    for (const place of places) {
      if (!isBuddhistPlaceTradition(place.tradition)) {
        otherTraditionIds.add(canonicalOtherId(place.tradition));
      }
    }
  }

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
  places: Pick<Place, "name" | "tradition" | "schools">[],
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
  places: Pick<Place, "name" | "tradition" | "schools">[],
  selectedTraditions: string[],
): TraditionFilterGroup[] {
  return getTraditionFilterGroups(places, [], "locations", selectedTraditions);
}
