import type { MetadataRoute } from "next";
import { getAllPlaceIds } from "@/lib/data/places";
import { getAllTeacherSlugs } from "@/lib/data/teachers";

const baseUrl = process.env.BETTER_AUTH_URL ?? "https://dharmaatlas.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [placeIds, teacherSlugs] = await Promise.all([
    getAllPlaceIds(),
    getAllTeacherSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/locations",
    "/people",
    "/about",
    "/submit",
    "/claim",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const placeRoutes = placeIds.map((id) => ({
    url: `${baseUrl}/place/${id}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const teacherRoutes = teacherSlugs.map((slug) => ({
    url: `${baseUrl}/person/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...placeRoutes, ...teacherRoutes];
}
