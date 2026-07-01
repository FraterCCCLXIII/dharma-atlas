import type { Teacher } from "@/types/teacher";

/** Death before this year is treated as mythic / pre-modern. */
export const MYTHIC_DEATH_BEFORE_YEAR = 1500;

/** Death from this year onward is treated as recent lineage (living memory). */
export const LINEAGE_DEATH_FROM_YEAR = 1900;

export type PeopleLifeEra =
  | "all"
  | "living"
  | "lineage"
  | "historic"
  | "mythic";

export const PEOPLE_LIFE_ERA_LABELS: Record<PeopleLifeEra, string> = {
  all: "All",
  living: "Living",
  lineage: "Lineage",
  historic: "Historic",
  mythic: "Mythic",
};

export const PEOPLE_LIFE_ERA_ORDER: PeopleLifeEra[] = [
  "all",
  "living",
  "lineage",
  "historic",
  "mythic",
];

export function classifyTeacherLifeEra(teacher: Teacher): Exclude<PeopleLifeEra, "all"> {
  if (teacher.deathYear == null) {
    return "living";
  }

  if (teacher.deathYear < MYTHIC_DEATH_BEFORE_YEAR) {
    return "mythic";
  }

  if (teacher.deathYear < LINEAGE_DEATH_FROM_YEAR) {
    return "historic";
  }

  return "lineage";
}

export function teacherMatchesLifeEra(
  teacher: Teacher,
  era: PeopleLifeEra,
): boolean {
  if (era === "all") return true;
  return classifyTeacherLifeEra(teacher) === era;
}
