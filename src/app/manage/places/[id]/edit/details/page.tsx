import { OwnerPlaceDetailsForm } from "@/components/manage/OwnerPlaceDetailsForm";
import { requireManagedPlace } from "@/lib/manage-place-access";

export default async function EditManagedPlaceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await requireManagedPlace(id);

  return <OwnerPlaceDetailsForm place={place} />;
}
