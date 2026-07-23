import { OwnerPlaceEditShell } from "@/components/manage/OwnerPlaceEditShell";
import { getPlaceEvents } from "@/lib/data/place-events";
import { getPlaceSocials } from "@/lib/data/place-socials";
import { getPlaceTeachers } from "@/lib/data/place-teachers";
import { requireManagedPlace } from "@/lib/manage-place-access";
import { getPlaceOnboardingStatus } from "@/lib/manage-place-onboarding";

export default async function EditManagedPlaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await requireManagedPlace(id);
  const [teachers, listings, socials] = await Promise.all([
    getPlaceTeachers(id),
    getPlaceEvents(id),
    getPlaceSocials(id),
  ]);
  const onboarding = getPlaceOnboardingStatus(place, {
    teacherCount: teachers.length,
    listingCount: listings.length,
    socialCount: socials.length,
  });

  return (
    <OwnerPlaceEditShell place={place} onboarding={onboarding}>
      {children}
    </OwnerPlaceEditShell>
  );
}
