import type { Metadata } from "next";
import { ClaimLocationPageView } from "@/components/claim/ClaimLocationPageView";

export const metadata: Metadata = {
  title: "Claim a listing | Dharma Atlas",
  robots: { index: false, follow: false },
};

export default async function ManageClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ place?: string }>;
}) {
  const { place: placeId } = await searchParams;
  let initialPlaceName: string | undefined;

  if (placeId) {
    const { getPlaceById } = await import("@/lib/data/places");
    const place = await getPlaceById(placeId);
    initialPlaceName = place?.name;
  }

  return (
    <ClaimLocationPageView
      initialPlaceId={placeId}
      initialPlaceName={initialPlaceName}
      embedded
    />
  );
}
