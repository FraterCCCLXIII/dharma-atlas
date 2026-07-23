import { PlaceOfferingsField } from "@/components/manage/PlaceOfferingsField";
import { requireManagedPlace } from "@/lib/manage-place-access";

export default async function EditManagedPlaceOfferingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await requireManagedPlace(id);

  return <PlaceOfferingsField place={place} />;
}
