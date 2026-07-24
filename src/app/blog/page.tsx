import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogHomeView } from "@/components/blog/BlogHomeView";
import { getAllBlogPosts } from "@/content/blog";
import { SHOW_BLOG } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Blog | Dharma Atlas",
  description:
    "Building Dharma Atlas in the open — product notes, catalog craft, and guides for places, people, and contemplative practice.",
};

export default function BlogPage() {
  if (!SHOW_BLOG) notFound();

  return <BlogHomeView posts={getAllBlogPosts()} />;
}
