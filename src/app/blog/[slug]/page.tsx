import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticleView } from "@/components/blog/BlogArticleView";
import {
  getAllBlogPostSlugs,
  getBlogPost,
  getRelatedBlogPosts,
} from "@/content/blog";
import { SHOW_BLOG } from "@/lib/feature-flags";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  if (!SHOW_BLOG) return [];
  return getAllBlogPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!SHOW_BLOG) {
    return { title: "Blog | Dharma Atlas" };
  }

  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return { title: "Blog | Dharma Atlas" };
  }

  return {
    title: `${post.title} | Blog | Dharma Atlas`,
    description: post.summary,
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  if (!SHOW_BLOG) notFound();

  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <BlogArticleView post={post} related={getRelatedBlogPosts(slug, 3)} />
  );
}
