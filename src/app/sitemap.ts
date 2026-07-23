import type { MetadataRoute } from "next";
import { getAllTraditionArticleSlugs } from "@/content/traditions";
import { getAllPlaceSlugs } from "@/lib/data/places";
import { getAllTeacherSlugs } from "@/lib/data/teachers";
import { SHOW_TRADITIONS } from "@/lib/feature-flags";

const baseUrl = process.env.BETTER_AUTH_URL ?? "https://dharmaatlas.com";

export const revalidate = 3600;

function staticSitemapEntries(): MetadataRoute.Sitemap {
  const traditionRoutes = SHOW_TRADITIONS
    ? [
        "/traditions",
        ...getAllTraditionArticleSlugs().map((slug) => `/traditions/${slug}`),
      ]
    : [];

  return [
    "",
    "/places",
    "/people",
    "/about",
    "/add",
    "/submit",
    "/claim",
    ...traditionRoutes,
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : path.startsWith("/traditions") ? 0.7 : 0.8,
  }));
}

async function dynamicSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const [placeSlugs, teacherSlugs] = await Promise.all([
      getAllPlaceSlugs(),
      getAllTeacherSlugs(),
    ]);

    const placeRoutes = placeSlugs.map((slug) => ({
      url: `${baseUrl}/place/${slug}`,
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
