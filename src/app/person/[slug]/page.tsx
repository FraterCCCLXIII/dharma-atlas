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

export const revalidate = 3600;

// Return [] so nothing is prerendered at build (the Docker build has no DB) but
// the route still opts into the full-route cache: each person is rendered on its
// first request and cached, then revalidated hourly. Without this, a dynamic
// param route renders on every request and `revalidate` has no effect.
export async function generateStaticParams() {
  return [];
}

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
