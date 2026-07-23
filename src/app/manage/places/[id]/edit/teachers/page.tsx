import { PlaceGuidingTeachersField } from "@/components/manage/PlaceGuidingTeachersField";
import { getPlaceTeachers } from "@/lib/data/place-teachers";
import { requireManagedPlace } from "@/lib/manage-place-access";

export default async function EditManagedPlaceTeachersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireManagedPlace(id);
  const teachers = await getPlaceTeachers(id);

  return <PlaceGuidingTeachersField placeId={id} initialTeachers={teachers} />;
}
