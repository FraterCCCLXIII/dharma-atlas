import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeacherPageView } from "@/components/teacher/TeacherPageView";
import {
  getAllTeachers,
  getSimilarTeachers,
  getTeacherBySlug,
  getTeacherStaticParams,
} from "@/lib/teachers-dataset";

interface TeacherPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getTeacherStaticParams();
}

export async function generateMetadata({
  params,
}: TeacherPageProps): Promise<Metadata> {
  const { slug } = await params;
  const teacher = getTeacherBySlug(slug);

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
  const teacher = getTeacherBySlug(slug);

  if (!teacher) {
    notFound();
  }

  const allTeachers = getAllTeachers();
  const similar = getSimilarTeachers(teacher);

  return (
    <TeacherPageView
      teacher={teacher}
      similar={similar}
      allTeachers={allTeachers}
    />
  );
}
