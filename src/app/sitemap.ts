import type { MetadataRoute } from "next";
import { getAllPlaceIds } from "@/lib/data/places";
import { getAllTeacherSlugs } from "@/lib/data/teachers";

const baseUrl = process.env.BETTER_AUTH_URL ?? "https://dharmaatlas.com";

export const revalidate = 3600;

function staticSitemapEntries(): MetadataRoute.Sitemap {
  return ["", "/locations", "/people", "/about", "/submit", "/claim"].map(
    (path) => ({
      url: `${baseUrl}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    }),
  );
}

async function dynamicSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const [placeIds, teacherSlugs] = await Promise.all([
      getAllPlaceIds(),
      getAllTeacherSlugs(),
    ]);

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

    return [...placeRoutes, ...teacherRoutes];
  } catch {
    // Docker/Coolify builds have no database — ship static routes only at build time.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicEntries = await dynamicSitemapEntries();
  return [...staticSitemapEntries(), ...dynamicEntries];
}
