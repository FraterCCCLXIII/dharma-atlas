import { notFound } from "next/navigation";
import { OwnerPlaceForm } from "@/components/manage/OwnerPlaceForm";
import { getPlaceById } from "@/lib/data/places";
import { canEditPlace } from "@/lib/place-access";
import { getSession } from "@/lib/auth-server";

export default async function EditMemberPlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) notFound();

  const { id } = await params;
  const allowed = await canEditPlace(session.user.id, session.user.role, id);
  if (!allowed) notFound();

  const place = await getPlaceById(id, { includeDrafts: true });
  if (!place) notFound();

  return (
    <div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold">
        Edit listing
      </h1>
      <p className="mt-2 text-sm text-ink-muted">Update public details for {place.name}.</p>
      <div className="mt-8">
        <OwnerPlaceForm place={place} />
      </div>
    </div>
  );
}
