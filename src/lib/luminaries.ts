import { getTeacherBrowseGroupId } from "@/lib/teacher-groups";
import { classifyTeacherLifeEra } from "@/lib/teacher-life-era";
import type { Teacher } from "@/types/teacher";

export const RECENT_PASSING_YEARS = 5;

/** Widely recognized teachers shown prominently in the Luminaries carousel. */
export const FEATURED_LUMINARY_SLUGS = [
  "tenzin-gyatso",
  "eckhart-tolle",
  "yongey-mingyur-rinpoche",
  "adyashanti",
  "jack-kornfield",
  "sharon-salzberg",
  "pema-chodron",
  "thich-nhat-hanh",
  "ram-dass",
  "robert-thurman",
] as const;

function lineageScore(teacher: Teacher): number {
  const deathYear = teacher.deathYear ?? 0;
  const hasBio = teacher.shortBio.trim().length > 0 ? 1 : 0;
  const hasTopics = teacher.topics.length > 0 ? 1 : 0;
  return deathYear * 10 + hasBio + hasTopics;
}

function isEligibleLuminary(teacher: Teacher): boolean {
  return Boolean(teacher.photo) && !teacher.isDraft;
}

export function getLuminaries(teachers: Teacher[], limit = 18): Teacher[] {
  const bySlug = new Map(teachers.map((teacher) => [teacher.slug, teacher]));
  const picked: Teacher[] = [];
  const seenSlugs = new Set<string>();
  const seenGroups = new Set<string>();

  const addTeacher = (teacher: Teacher) => {
    if (seenSlugs.has(teacher.slug)) return false;
    seenSlugs.add(teacher.slug);
    seenGroups.add(getTeacherBrowseGroupId(teacher));
    picked.push(teacher);
    return picked.length >= limit;
  };

  for (const slug of FEATURED_LUMINARY_SLUGS) {
    const teacher = bySlug.get(slug);
    if (!teacher || !isEligibleLuminary(teacher)) continue;
    if (addTeacher(teacher)) return picked;
  }

  const lineageCandidates = teachers
    .filter(
      (teacher) =>
        isEligibleLuminary(teacher) &&
        !seenSlugs.has(teacher.slug) &&
        classifyTeacherLifeEra(teacher) === "lineage",
    )
    .sort(
      (a, b) =>
        lineageScore(b) - lineageScore(a) ||
        a.name.localeCompare(b.name, "en"),
    );

  for (const teacher of lineageCandidates) {
    const groupId = getTeacherBrowseGroupId(teacher);
    if (seenGroups.has(groupId)) continue;
    if (addTeacher(teacher)) return picked;
  }

  for (const teacher of lineageCandidates) {
    if (addTeacher(teacher)) return picked;
  }

  return picked;
}

export function isRecentlyPassed(
  teacher: Teacher,
  now = new Date(),
): boolean {
  if (teacher.deathYear == null) return false;

  const cutoffYear = now.getFullYear() - RECENT_PASSING_YEARS;
  return teacher.deathYear >= cutoffYear;
}

export function getRecentlyPassedTeachers(
  teachers: Teacher[],
  limit = 24,
  now = new Date(),
  excludeSlugs: ReadonlySet<string> = new Set(),
): Teacher[] {
  return teachers
    .filter(
      (teacher) =>
        teacher.photo &&
        !teacher.isDraft &&
        !excludeSlugs.has(teacher.slug) &&
        isRecentlyPassed(teacher, now),
    )
    .sort(
      (a, b) =>
        (b.deathYear ?? 0) - (a.deathYear ?? 0) ||
        a.name.localeCompare(b.name, "en"),
    )
    .slice(0, limit);
}

export function getPeoplePageCarousels(
  teachers: Teacher[],
  now = new Date(),
): { luminaries: Teacher[]; remembering: Teacher[] } {
  const luminaries = getLuminaries(teachers);
  const luminarySlugs = new Set(luminaries.map((teacher) => teacher.slug));
  const remembering = getRecentlyPassedTeachers(
    teachers,
    24,
    now,
    luminarySlugs,
  );

  return { luminaries, remembering };
}
