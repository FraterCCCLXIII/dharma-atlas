import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PilgrimageCustomizeEditor } from "@/components/pilgrimage/PilgrimageCustomizeEditor";
import { getPilgrimageRoute } from "@/data/pilgrimage";
import { getSession } from "@/lib/auth-server";
import { SHOW_PILGRIMAGE } from "@/lib/feature-flags";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!SHOW_PILGRIMAGE) return {};
  const { slug } = await params;
  const route = getPilgrimageRoute(slug);
  if (!route) return { title: "Customize route" };
  return {
    title: `Customize ${route.name} | Pilgrimage | Dharma Atlas`,
    robots: { index: false, follow: false },
  };
}

export default async function CustomizePilgrimageRoutePage({ params }: Props) {
  if (!SHOW_PILGRIMAGE) notFound();
  const { slug } = await params;
  const route = getPilgrimageRoute(slug);
  if (!route) notFound();

  const session = await getSession();
  if (!session) {
    redirect(
      `/login?redirect=${encodeURIComponent(`/pilgrimage/routes/${slug}/customize`)}`,
    );
  }

  return <PilgrimageCustomizeEditor route={route} />;
}
