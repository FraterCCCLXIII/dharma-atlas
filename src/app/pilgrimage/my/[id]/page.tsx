import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { UserPilgrimageRouteView } from "@/components/pilgrimage/UserPilgrimageRouteView";
import { getSession } from "@/lib/auth-server";
import { getUserPilgrimageRoute } from "@/lib/data/user-pilgrimage-routes";
import { SHOW_PILGRIMAGE } from "@/lib/feature-flags";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "My route | Pilgrimage | Dharma Atlas",
  robots: { index: false, follow: false },
};

export default async function MyPilgrimageRoutePage({ params }: Props) {
  if (!SHOW_PILGRIMAGE) notFound();
  const session = await getSession();
  if (!session) {
    const { id } = await params;
    redirect(`/login?redirect=/pilgrimage/my/${id}`);
  }

  const { id } = await params;
  const route = await getUserPilgrimageRoute(session.user.id, id);
  if (!route) notFound();

  return <UserPilgrimageRouteView route={route} isOwner />;
}
