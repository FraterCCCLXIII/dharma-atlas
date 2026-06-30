import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeacherPageView } from "@/components/teacher/TeacherPageView";
import {
  getSimilarTeachers,
  getTeacherBySlug,
  getTeacherPhotoMap,
} from "@/lib/teachers-dataset";

interface PersonPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PersonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);

  if (!teacher) {
    return { title: "Person not found | Dharma Atlas" };
  }

  return {
    title: `${teacher.name} | Dharma Atlas`,
    description: teacher.shortBio,
    openGraph: {
      title: `${teacher.name} | Dharma Atlas`,
      description: teacher.shortBio,
      images: teacher.heroPhoto ?? teacher.photo ? [teacher.heroPhoto ?? teacher.photo] : undefined,
    },
  };
}

export default async function PersonPage({ params }: PersonPageProps) {
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
