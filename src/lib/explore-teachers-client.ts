import type { Teacher } from "@/types/teacher";

let teachersCache: Teacher[] | null = null;
let teachersPromise: Promise<Teacher[]> | null = null;

/** Session-scoped fetch of slim explore teachers (home/people directory). */
export function fetchExploreTeachers(): Promise<Teacher[]> {
  if (teachersCache) return Promise.resolve(teachersCache);
  if (!teachersPromise) {
    teachersPromise = fetch("/api/explore/teachers-directory")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load teachers (${res.status})`);
        }
        const data = (await res.json()) as { teachers: Teacher[] };
        teachersCache = data.teachers ?? [];
        return teachersCache;
      })
      .catch((error) => {
        teachersPromise = null;
        throw error;
      });
  }
  return teachersPromise;
}

export function getCachedExploreTeachersClient(): Teacher[] | null {
  return teachersCache;
}
