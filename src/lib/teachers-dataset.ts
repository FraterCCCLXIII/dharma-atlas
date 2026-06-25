import teachersDataset from "@/data/teachers.json";
import type { Teacher, TeachersDataset } from "@/types/teacher";

const data = teachersDataset as TeachersDataset;

export function getAllTeachers() {
  return data.teachers;
}

export function getTeacherBySlug(slug: string) {
  return data.teachers.find((teacher) => teacher.slug === slug) ?? null;
}

export function getSimilarTeachers(teacher: Teacher, limit = 4): Teacher[] {
  return data.teachers
    .filter((candidate) => candidate.slug !== teacher.slug)
    .sort((a, b) => {
      const aSameTradition = a.tradition === teacher.tradition ? 0 : 1;
      const bSameTradition = b.tradition === teacher.tradition ? 0 : 1;
      if (aSameTradition !== bSameTradition) {
        return aSameTradition - bSameTradition;
      }

      const aSameLineage = a.lineage === teacher.lineage ? 0 : 1;
      const bSameLineage = b.lineage === teacher.lineage ? 0 : 1;
      if (aSameLineage !== bSameLineage) return aSameLineage - bSameLineage;

      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

export function getTeacherStaticParams() {
  return data.teachers.map((teacher) => ({ slug: teacher.slug }));
}

export function getTeachersDatasetMeta() {
  return {
    source: data.source,
    sourceName: data.sourceName,
    count: data.count,
  };
}
