"use client";

import { PilgrimageFavoriteButton } from "@/components/pilgrimage/PilgrimageFavoriteButton";
import { PilgrimageShareButton } from "@/components/pilgrimage/PilgrimageShareButton";

export function PilgrimageSiteActions({
  slug,
  name,
  summary,
}: {
  slug: string;
  name: string;
  summary: string;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <PilgrimageFavoriteButton kind="site" slug={slug} />
      <PilgrimageShareButton title={name} text={summary} />
    </div>
  );
}
