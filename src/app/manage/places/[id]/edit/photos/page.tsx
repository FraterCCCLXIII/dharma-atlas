import { PlacePhotosField } from "@/components/admin/PlacePhotosField";
import { requireManagedPlace } from "@/lib/manage-place-access";
import { MAX_PLACE_PHOTOS } from "@/types/place";

export default async function EditManagedPlacePhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await requireManagedPlace(id);

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Photos</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Add up to {MAX_PLACE_PHOTOS} images. The first photo is the cover shown in
          lists and on the map.
        </p>
      </div>
      <PlacePhotosField
        placeId={place.id}
        initialPhotos={place.photos ?? []}
        showHeading={false}
      />
    </div>
  );
}
