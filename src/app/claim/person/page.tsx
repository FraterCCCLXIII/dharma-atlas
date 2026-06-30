import type { Metadata } from "next";
import { ClaimTeacherPageView } from "@/components/claim/ClaimTeacherPageView";

export const metadata: Metadata = {
  title: "Claim a teacher profile | Dharma Atlas",
  description: "Request to manage or update a teacher listing on Dharma Atlas.",
};

export default async function ClaimTeacherPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  let initialName: string | undefined;

  if (slug) {
    const { getTeacherBySlug } = await import("@/lib/data/teachers");
    const teacher = await getTeacherBySlug(slug);
    initialName = teacher?.name;
  }

  return <ClaimTeacherPageView initialSlug={slug} initialName={initialName} />;
}
