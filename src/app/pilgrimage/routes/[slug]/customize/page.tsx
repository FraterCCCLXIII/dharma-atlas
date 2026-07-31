import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPilgrimageRoute } from "@/data/pilgrimage";
import { getSession } from "@/lib/auth-server";
import { createUserPilgrimageRoute } from "@/lib/data/user-pilgrimage-routes";
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

/** Fork a canonical route into the user's saved itineraries, then open the editor. */
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

  const saved = await createUserPilgrimageRoute(session.user.id, {
    title: `My ${route.name}`,
    stopSlugs: [...route.stopSlugs],
    baseRouteSlug: route.slug,
  });

  // Note: revalidatePath cannot be called during render (only in Server
  // Actions / Route Handlers). /favorites is session-gated and rendered
  // dynamically, so no cache invalidation is needed here.
  redirect(`/pilgrimage/my/${saved.id}/edit`);
}
