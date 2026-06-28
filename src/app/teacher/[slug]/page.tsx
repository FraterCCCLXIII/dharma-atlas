import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeacherPageView } from "@/components/teacher/TeacherPageView";
import {
  getSimilarTeachers,
  getTeacherBySlug,
  getTeacherPhotoMap,
} from "@/lib/teachers-dataset";

interface TeacherPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: TeacherPageProps): Promise<Metadata> {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);

  if (!teacher) {
    return { title: "Teacher not found | Dharma Streams" };
  }

  return {
    title: `${teacher.name} | Dharma Streams`,
    description: teacher.shortBio,
    openGraph: {
      title: `${teacher.name} | Dharma Streams`,
      description: teacher.shortBio,
      images: teacher.heroPhoto ?? teacher.photo ? [teacher.heroPhoto ?? teacher.photo] : undefined,
    },
  };
}

export default async function TeacherPage({ params }: TeacherPageProps) {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);

  if (!teacher) {
    notFound();
  }

  const [similar, photoMap] = await Promise.all([
    getSimilarTeachers(teacher),
    getTeacherPhotoMap(),
  ]);

  const teacherPhotos = Object.fromEntries(photoMap);

  return (
    <TeacherPageView
      teacher={teacher}
      similar={similar}
      teacherPhotos={teacherPhotos}
    />
  );
}
