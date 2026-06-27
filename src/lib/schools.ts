import type { Place } from "@/types/place";

export type EntityScope = "all" | "locations" | "people";

/** Root Buddhist tradition id stored in filters and place/teacher data. */
export const BUDDHIST_TRADITION_ID = "Buddhist";

/** Display label for the Buddhist root tradition filter. */
export const BUDDHIST_TRADITION_LABEL = "Buddhism";

/** Labels for subschool slugs (specific sects and branches). */
export const SUBSCHOOL_LABELS: Record<string, string> = {
  nyingma: "Nyingma",
  kagyu: "Kagyu",
  gelug: "Gelug",
  sakya: "Sakya",
  bon: "Bon",
  shambhala: "Shambhala",
  "diamond-way": "Diamond Way",
  soto: "Soto",
  rinzai: "Rinzai",
  obaku: "Obaku",
  chan: "Chan",
  son: "Son (Korean)",
  thien: "Thiền (Vietnamese)",
  "sanbo-zen": "Sanbo Zen",
  "dharma-drum": "Dharma Drum",
  vipassana: "Vipassana",
  insight: "Insight Meditation",
  "thai-forest": "Thai Forest",
  thai: "Thai",
  burmese: "Burmese",
  lao: "Lao",
  cambodian: "Cambodian",
  "sri-lankan": "Sri Lankan",
  "soka-gakkai": "Soka Gakkai",
  "jodo-shin": "Jodo Shin",
  "jodo-shu": "Jodo Shu",
};

/** @deprecated Use SUBSCHOOL_LABELS */
export const SCHOOL_LABELS = SUBSCHOOL_LABELS;

export type LineageSchoolDef = {
  slug: string;
  id: string;
  label: string;
  placeTraditions: string[];
};

/**
 * Major Buddhist schools (lineages / vehicles) nested under Buddhism.
 * Filter id matches place.tradition where applicable.
 */
export const LINEAGE_SCHOOLS: LineageSchoolDef[] = [
  {
    slug: "tibetan",
    id: "Tibetan",
    label: "Tibetan",
    placeTraditions: ["Tibetan"],
  },
  {
    slug: "zen",
    id: "Zen",
    label: "Zen",
    placeTraditions: ["Zen", "Chinese", "Vietnamese"],
  },
  {
    slug: "theravada",
    id: "Theravada",
    label: "Theravada",
    placeTraditions: ["Theravada"],
  },
  {
    slug: "southeast-asian",
    id: "Southeast Asian",
    label: "Southeast Asian",
    placeTraditions: ["Southeast Asian"],
  },
  {
    slug: "pure-land",
    id: "Pure Land",
    label: "Pure Land",
    placeTraditions: ["Pure Land"],
  },
  {
    slug: "won",
    id: "Won Buddhism",
    label: "Won Buddhism",
    placeTraditions: ["Won Buddhism"],
  },
  {
    slug: "mahayana",
    id: "Mahayana",
    label: "Mahayana",
    placeTraditions: ["Mahayana"],
  },
];

export const BUDDHIST_PLACE_TRADITIONS = [
  BUDDHIST_TRADITION_ID,
  ...LINEAGE_SCHOOLS.flatMap((school) => school.placeTraditions),
];

/** @deprecated Use LINEAGE_SCHOOLS ids */
export const TRADITIONS_WITH_SCHOOLS = LINEAGE_SCHOOLS.map((school) => school.id);

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

type SubschoolRule = {
  slug: string;
  lineageSchool: string;
  placeTraditions: string[];
  pattern: RegExp;
};

const SUBSCHOOL_RULES: SubschoolRule[] = [
  {
    slug: "nyingma",
    lineageSchool: "tibetan",
    placeTraditions: ["Tibetan"],
    pattern:
      /nyingma|palyul|dzogchen|drikung dzogchen|emaho|saraha|ati ling|chagdud|padma ling|longchen|nam cho|buddha dharma|buddha-dharma/i,
  },
  {
    slug: "kagyu",
    lineageSchool: "tibetan",
    placeTraditions: ["Tibetan"],
    pattern:
      /kagyu|karma thegsum|karma kagy|ktd\b|ktc\b|thegsum choling|drikung(?! dzogchen)|drigung|barom kagyu|kagyu changchub|kagyu droden|kagyu sukha|kagyu takten|karme ling|karmapa/i,
  },
  {
    slug: "gelug",
    lineageSchool: "tibetan",
    placeTraditions: ["Tibetan"],
    pattern:
      /gelug|ganden|sera je|seraje|drepung|tashi lh|tashi gomang|fpmt|liberation prison|jewel heart|guhyasamaja|tushita|gaden/i,
  },
  {
    slug: "sakya",
    lineageSchool: "tibetan",
    placeTraditions: ["Tibetan"],
    pattern: /sakya|sakyong|sakya phuntsok|sakya monastery/i,
  },
  {
    slug: "bon",
    lineageSchool: "tibetan",
    placeTraditions: ["Tibetan"],
    pattern: /\bbon\b|yungdrung bon|riwo sang/i,
  },
  {
    slug: "shambhala",
    lineageSchool: "tibetan",
    placeTraditions: ["Tibetan", "Buddhist"],
    pattern: /shambhala/i,
  },
  {
    slug: "diamond-way",
    lineageSchool: "tibetan",
    placeTraditions: ["Tibetan"],
    pattern: /diamond way/i,
  },
  {
    slug: "soto",
    lineageSchool: "zen",
    placeTraditions: ["Zen"],
    pattern: /soto|sfzc|san francisco zen center|zen center of los angeles|zcla\b/i,
  },
  {
    slug: "rinzai",
    lineageSchool: "zen",
    placeTraditions: ["Zen"],
    pattern: /rinzai|ryugenji|daiyuzenji|korinji|rinzai-ji/i,
  },
  {
    slug: "obaku",
    lineageSchool: "zen",
    placeTraditions: ["Zen"],
    pattern: /obaku/i,
  },
  {
    slug: "chan",
    lineageSchool: "zen",
    placeTraditions: ["Zen", "Chinese"],
    pattern:
      /chan (center|monastery|temple)|chung tai|dharma drum|ddmba|fo guang|foguang|dharma realm|city of ten thousand buddhas|cttb\b/i,
  },
  {
    slug: "son",
    lineageSchool: "zen",
    placeTraditions: ["Zen"],
    pattern: /\bson\b|kwan um|seung sahn|korean zen|bo hyun sa|hwagyesa|musangsa/i,
  },
  {
    slug: "thien",
    lineageSchool: "zen",
    placeTraditions: ["Zen", "Vietnamese"],
    pattern: /thien (that|tam|vien)|thien that|thien tam|thien vien/i,
  },
  {
    slug: "sanbo-zen",
    lineageSchool: "zen",
    placeTraditions: ["Zen"],
    pattern: /sanbo zen|san-un|san un/i,
  },
  {
    slug: "dharma-drum",
    lineageSchool: "zen",
    placeTraditions: ["Zen"],
    pattern: /dharma drum|ddmba/i,
  },
  {
    slug: "vipassana",
    lineageSchool: "theravada",
    placeTraditions: ["Theravada"],
    pattern: /vipassana|dhamma [a-z]|dhamma\b/i,
  },
  {
    slug: "insight",
    lineageSchool: "theravada",
    placeTraditions: ["Theravada"],
    pattern: /insight (meditation|denver|community|retreat)|heart of the dharma/i,
  },
  {
    slug: "thai-forest",
    lineageSchool: "theravada",
    placeTraditions: ["Theravada"],
    pattern: /thai forest|forest monastery|wat metta|abhayagiri|amaravati/i,
  },
  {
    slug: "thai",
    lineageSchool: "southeast-asian",
    placeTraditions: ["Southeast Asian"],
    pattern: /\bthai(?! forest)\b|wat [a-z]|wat\b/i,
  },
  {
    slug: "burmese",
    lineageSchool: "southeast-asian",
    placeTraditions: ["Southeast Asian"],
    pattern: /burmese|chanmyay|myanmar|ဇေယျ/i,
  },
  {
    slug: "lao",
    lineageSchool: "southeast-asian",
    placeTraditions: ["Southeast Asian"],
    pattern: /\blao\b/i,
  },
  {
    slug: "cambodian",
    lineageSchool: "southeast-asian",
    placeTraditions: ["Southeast Asian"],
    pattern: /cambodian|khmer|wat khmer/i,
  },
  {
    slug: "sri-lankan",
    lineageSchool: "southeast-asian",
    placeTraditions: ["Southeast Asian"],
    pattern: /sri lankan|sinhalese|sinhala/i,
  },
  {
    slug: "soka-gakkai",
    lineageSchool: "pure-land",
    placeTraditions: ["Pure Land"],
    pattern: /soka gakkai|sgi-usa|sgi usa|\bsgi\b|fncc\b/i,
  },
  {
    slug: "jodo-shin",
    lineageSchool: "pure-land",
    placeTraditions: ["Pure Land"],
    pattern: /jodo shin|shinshu|hongwanji|nishi hongwanji|higashi hongwanji|buddhist church of/i,
  },
  {
    slug: "jodo-shu",
    lineageSchool: "pure-land",
    placeTraditions: ["Pure Land"],
    pattern: /jodo shu|jodoshu|jōdo shū/i,
  },
];

function getLineageSchoolById(id: string): LineageSchoolDef | undefined {
  return LINEAGE_SCHOOLS.find((school) => school.id === id);
}

export function subschoolLabel(slug: string): string {
  return SUBSCHOOL_LABELS[slug] ?? slug;
}

/** @deprecated Use subschoolLabel */
export function schoolLabel(slug: string): string {
  return subschoolLabel(slug);
}

export function isBuddhistPlaceTradition(tradition: string): boolean {
  return BUDDHIST_PLACE_TRADITIONS.includes(tradition);
}

export function isBuddhistTeacherTradition(tradition: string): boolean {
  return tradition === BUDDHIST_TRADITION_ID;
}

export function getSubschoolSlugsForLineageSchool(schoolSlug: string): string[] {
  return SUBSCHOOL_RULES.filter((rule) => rule.lineageSchool === schoolSlug).map(
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
    return SUBSCHOOL_RULES.map((rule) => rule.slug);
  }
  return getSubschoolSlugsForLineageSchoolId(tradition);
}

export type LineageFilterState = {
  traditions: string[];
  schools: string[];
};

const LINEAGE_SCHOOL_IDS = LINEAGE_SCHOOLS.map((school) => school.id);

function otherTraditions(state: LineageFilterState): string[] {
  return state.traditions.filter(
    (tradition) =>
      tradition !== BUDDHIST_TRADITION_ID && !LINEAGE_SCHOOL_IDS.includes(tradition),
  );
}

export function isBuddhismRootSelected(state: LineageFilterState): boolean {
  return state.traditions.includes(BUDDHIST_TRADITION_ID);
}

export function getSubschoolParentSchoolId(subschool: string): string | null {
  const rule = SUBSCHOOL_RULES.find((entry) => entry.slug === subschool);
  if (!rule) return null;

  const school = LINEAGE_SCHOOLS.find((entry) => entry.slug === rule.lineageSchool);
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
    LINEAGE_SCHOOL_IDS.includes(tradition),
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
    LINEAGE_SCHOOL_IDS.includes(tradition),
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

  for (const rule of SUBSCHOOL_RULES) {
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

  for (const rule of SUBSCHOOL_RULES) {
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

  for (const school of LINEAGE_SCHOOLS) {
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
      for (const school of LINEAGE_SCHOOLS) {
        if (placeMatchesLineageSchool(place, school)) {
          schoolHasEntities.add(school.slug);
        }
      }

      for (const subschool of getSchools(place)) {
        const rule = SUBSCHOOL_RULES.find((entry) => entry.slug === subschool);
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
        for (const school of LINEAGE_SCHOOLS) {
          if (teacherMatchesLineageSchool(teacher, school)) {
            schoolHasEntities.add(school.slug);
          }
        }
      }

      for (const subschool of inferTeacherSchools(teacher)) {
        const rule = SUBSCHOOL_RULES.find((entry) => entry.slug === subschool);
        if (rule) {
          schoolHasEntities.add(rule.lineageSchool);
          addSubschoolToLineageSchool(subschoolsBySchool, rule.lineageSchool, subschool);
        }
      }
    }
  }

  return LINEAGE_SCHOOLS.filter((school) => schoolHasEntities.has(school.slug)).map(
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

  const otherTraditionIds = new Set<string>();

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

  return {
    buddhism: {
      id: BUDDHIST_TRADITION_ID,
      label: BUDDHIST_TRADITION_LABEL,
      schools,
    },
    otherTraditions: [...otherTraditionIds]
      .sort((a, b) => a.localeCompare(b))
      .map((id) => ({ id, label: id })),
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
