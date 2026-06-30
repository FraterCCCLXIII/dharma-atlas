import type { MetadataRoute } from "next";

const baseUrl = process.env.BETTER_AUTH_URL ?? "https://dharmaatlas.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/manage/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
