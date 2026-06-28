import { notFound } from "next/navigation";
import { PlaceForm } from "@/components/admin/PlaceForm";
import { placeToInput } from "@/lib/admin-mappers";
import { getPlaceById } from "@/lib/data/places";

export default async function EditPlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await getPlaceById(id);
  if (!place) notFound();

  return <PlaceForm mode="edit" initial={placeToInput(place)} />;
}
