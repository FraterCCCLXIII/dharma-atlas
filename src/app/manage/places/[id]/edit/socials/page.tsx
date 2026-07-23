import { PlaceSocialsField } from "@/components/manage/PlaceSocialsField";
import { getPlaceSocials } from "@/lib/data/place-socials";
import { requireManagedPlace } from "@/lib/manage-place-access";

export default async function EditManagedPlaceSocialsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireManagedPlace(id);
  const initialSocials = await getPlaceSocials(id);

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Social Links</h2>
        <p className="mt-1 text-sm text-ink-muted">
          YouTube, Instagram, Facebook, X, and other profiles visitors can follow.
        </p>
      </div>
      <PlaceSocialsField
        placeId={id}
        initialSocials={initialSocials}
        showHeading={false}
      />
    </div>
  );
}
