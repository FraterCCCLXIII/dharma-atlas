import { PlaceEventsField } from "@/components/manage/PlaceEventsField";
import { getPlaceEvents } from "@/lib/data/place-events";
import { requireManagedPlace } from "@/lib/manage-place-access";

export default async function EditManagedPlaceEventsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireManagedPlace(id);
  const events = await getPlaceEvents(id);

  return <PlaceEventsField placeId={id} initialEvents={events} />;
}
