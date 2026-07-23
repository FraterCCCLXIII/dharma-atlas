import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PilgrimageSiteView } from "@/components/pilgrimage/PilgrimageSiteView";
import {
  getAllPilgrimageSiteSlugs,
  getPilgrimageSite,
} from "@/data/pilgrimage";
import { SHOW_PILGRIMAGE } from "@/lib/feature-flags";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  if (!SHOW_PILGRIMAGE) return [];
  return getAllPilgrimageSiteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!SHOW_PILGRIMAGE) return {};
  const { slug } = await params;
  const site = getPilgrimageSite(slug);
  if (!site) return { title: "Pilgrimage site" };
  return {
    title: `${site.name} | Pilgrimage | Dharma Atlas`,
    description: site.summary,
  };
}

export default async function PilgrimageSitePage({ params }: Props) {
  if (!SHOW_PILGRIMAGE) notFound();
  const { slug } = await params;
  const site = getPilgrimageSite(slug);
  if (!site) notFound();
  return <PilgrimageSiteView site={site} />;
}
