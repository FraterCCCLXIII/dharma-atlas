import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PilgrimageSiteView } from "@/components/pilgrimage/PilgrimageSiteView";
import { getPilgrimageSite } from "@/data/pilgrimage";
import { getPlaceByPilgrimageSlug } from "@/lib/data/pilgrimage-routes";
import { placeProfilePath } from "@/lib/explore-routes";
import { SHOW_PILGRIMAGE } from "@/lib/feature-flags";

type Props = { params: Promise<{ slug: string }> };

/** Must run per-request — build-time static HTML baked redirects before places were seeded. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!SHOW_PILGRIMAGE) return {};
  const { slug } = await params;
  const linked = await getPlaceByPilgrimageSlug(slug);
  if (linked) {
    return {
      title: `${linked.name} | Dharma Atlas`,
      description: linked.description,
      alternates: { canonical: placeProfilePath(linked) },
    };
  }
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
  const linked = await getPlaceByPilgrimageSlug(slug);
  if (linked) {
    permanentRedirect(placeProfilePath(linked));
  }
  const site = getPilgrimageSite(slug);
  if (!site) notFound();
  return <PilgrimageSiteView site={site} />;
}
