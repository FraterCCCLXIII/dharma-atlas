import { notFound } from "next/navigation";
import { PlaceForm } from "@/components/admin/PlaceForm";
import { placeToInput } from "@/lib/admin-mappers";
import { getPlaceEvents } from "@/lib/data/place-events";
import { getPlaceById } from "@/lib/data/places";
import { getPlaceSocials } from "@/lib/data/place-socials";
import { getPlaceTeachers } from "@/lib/data/place-teachers";

export default async function EditPlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await getPlaceById(id, { includeDrafts: true, includeDeleted: true });
  if (!place) notFound();

  const [initialTeachers, initialEvents, initialSocials] = await Promise.all([
    getPlaceTeachers(id),
    getPlaceEvents(id),
    getPlaceSocials(id),
  ]);

  return (
    <PlaceForm
      mode="edit"
      initial={placeToInput(place)}
      initialPhotos={place.photos ?? []}
      initialTeachers={initialTeachers}
      initialEvents={initialEvents}
      initialSocials={initialSocials}
      isDeleted={Boolean(place.deletedAt)}
    />
  );
}
