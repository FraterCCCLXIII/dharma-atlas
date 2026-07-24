export type BlogTag =
  | "building-in-open"
  | "guides"
  | "catalogs"
  | "traditions"
  | "seo";

export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  /** ISO date (YYYY-MM-DD); used for sort and display */
  publishedAt: string;
  updatedAt?: string;
  tags: BlogTag[];
  /** Markdown body for MarkdownText (≥900 words) */
  body: string;
};
