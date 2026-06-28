import { notFound } from "next/navigation";
import { TeacherForm } from "@/components/admin/TeacherForm";
import { teacherToInput } from "@/lib/admin-mappers";
import { getTeacherBySlug } from "@/lib/data/teachers";

export default async function EditTeacherPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);
  if (!teacher) notFound();

  return <TeacherForm mode="edit" initial={teacherToInput(teacher)} />;
}
