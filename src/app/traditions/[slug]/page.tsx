import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TraditionArticleView } from "@/components/traditions/TraditionArticleView";
import { getAllTraditionArticleSlugs } from "@/content/traditions";
import { getTraditionPageData } from "@/lib/data/tradition-articles";
import { SHOW_TRADITIONS } from "@/lib/feature-flags";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  if (!SHOW_TRADITIONS) return [];
  return getAllTraditionArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!SHOW_TRADITIONS) {
    return { title: "Tradition | Dharma Atlas" };
  }

  const { slug } = await params;
  const data = await getTraditionPageData(slug);
  if (!data) {
    return { title: "Tradition | Dharma Atlas" };
  }

  return {
    title: `${data.node.label} | Traditions | Dharma Atlas`,
    description: data.article.summary,
  };
}

export default async function TraditionArticlePage({ params }: PageProps) {
  if (!SHOW_TRADITIONS) notFound();

  const { slug } = await params;
  const data = await getTraditionPageData(slug);
  if (!data) notFound();

  return <TraditionArticleView data={data} />;
}
