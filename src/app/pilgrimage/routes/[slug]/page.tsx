import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PilgrimageRouteView } from "@/components/pilgrimage/PilgrimageRouteView";
import {
  getAllPilgrimageRouteSlugs,
  getPilgrimageRoute,
} from "@/data/pilgrimage";
import { SHOW_PILGRIMAGE } from "@/lib/feature-flags";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  if (!SHOW_PILGRIMAGE) return [];
  return getAllPilgrimageRouteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!SHOW_PILGRIMAGE) return {};
  const { slug } = await params;
  const route = getPilgrimageRoute(slug);
  if (!route) return { title: "Pilgrimage route" };
  return {
    title: `${route.name} | Pilgrimage | Dharma Atlas`,
    description: route.summary,
  };
}

export default async function PilgrimageRoutePage({ params }: Props) {
  if (!SHOW_PILGRIMAGE) notFound();
  const { slug } = await params;
  const route = getPilgrimageRoute(slug);
  if (!route) notFound();
  return <PilgrimageRouteView route={route} />;
}
