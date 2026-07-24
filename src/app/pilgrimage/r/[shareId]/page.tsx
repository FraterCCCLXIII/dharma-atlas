import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserPilgrimageRouteView } from "@/components/pilgrimage/UserPilgrimageRouteView";
import { getUserPilgrimageRouteByShareId } from "@/lib/data/user-pilgrimage-routes";
import { SHOW_PILGRIMAGE } from "@/lib/feature-flags";

type Props = { params: Promise<{ shareId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!SHOW_PILGRIMAGE) return {};
  const { shareId } = await params;
  const route = await getUserPilgrimageRouteByShareId(shareId);
  if (!route) return { title: "Shared route" };
  return {
    title: `${route.title} | Pilgrimage | Dharma Atlas`,
    description: `A shared pilgrimage route with ${route.stopSlugs.length} stops.`,
  };
}

export default async function SharedPilgrimageRoutePage({ params }: Props) {
  if (!SHOW_PILGRIMAGE) notFound();
  const { shareId } = await params;
  const route = await getUserPilgrimageRouteByShareId(shareId);
  if (!route) notFound();
  return <UserPilgrimageRouteView route={route} />;
}
