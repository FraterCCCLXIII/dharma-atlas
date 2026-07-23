import { OwnerPlaceNoticesForm } from "@/components/manage/OwnerPlaceNoticesForm";
import { requireManagedPlace } from "@/lib/manage-place-access";

export default async function EditManagedPlaceNoticesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await requireManagedPlace(id);

  return <OwnerPlaceNoticesForm place={place} />;
}
