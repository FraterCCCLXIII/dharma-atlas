import { OwnerPlaceAboutForm } from "@/components/manage/OwnerPlaceAboutForm";
import { requireManagedPlace } from "@/lib/manage-place-access";

export default async function EditManagedPlaceAboutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await requireManagedPlace(id);

  return <OwnerPlaceAboutForm place={place} />;
}
