export {
  getAllTeachers,
  getTeacherBySlug,
  getSimilarTeachers,
  getTeacherStaticParams,
  getTeacherPhotoMap,
  getTeachersCount,
} from "@/lib/data/teachers";

export async function getTeachersDatasetMeta() {
  const { getTeachersCount } = await import("@/lib/data/teachers");
  const count = await getTeachersCount();
  return {
    source: "database",
    sourceName: "Wisdom Archive",
    count,
  };
}
