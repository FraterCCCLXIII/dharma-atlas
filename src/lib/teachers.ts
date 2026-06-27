import { inferTeacherSchools, teacherMatchesTradition } from "@/lib/schools";
import type { Teacher } from "@/types/teacher";

export interface TeacherFilters {
  query: string;
  traditions: string[];
  schools: string[];
}

export function filterTeachers(
  teachers: Teacher[],
  filters: TeacherFilters,
): Teacher[] {
  const q = filters.query.trim().toLowerCase();

  return teachers.filter((teacher) => {
    if (q) {
      const haystack = [
        teacher.name,
        teacher.tradition,
        teacher.lineage,
        teacher.location,
        teacher.shortBio,
        ...teacher.topics,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.traditions.length) {
      const matchesTradition = filters.traditions.some((tradition) =>
        teacherMatchesTradition(teacher, tradition),
      );
      if (!matchesTradition) return false;
    }
    if (filters.schools.length) {
      const teacherSchools = inferTeacherSchools(teacher);
      if (!filters.schools.some((school) => teacherSchools.includes(school))) {
        return false;
      }
    }
    return true;
  });
}

export function getTeacherTraditions(teachers: Teacher[]): string[] {
  return [...new Set(teachers.map((t) => t.tradition))].sort();
}

export function teacherTraditionGradient(tradition: string): string {
  const gradients: Record<string, string> = {
    Buddhist: "from-slate-600 via-gray-700 to-slate-900",
    "Advaita Vedanta": "from-orange-700 via-amber-600 to-yellow-900",
    Sufi: "from-emerald-800 via-teal-700 to-cyan-900",
    "Contemplative Christian": "from-indigo-800 via-violet-700 to-purple-900",
    "Indigenous Wisdom": "from-lime-800 via-green-700 to-emerald-900",
    "Non-Dualism": "from-violet-800 via-purple-700 to-fuchsia-900",
  };
  return gradients[tradition] ?? "from-stone-600 via-neutral-700 to-zinc-900";
}
