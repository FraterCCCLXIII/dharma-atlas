import type { Metadata } from "next";
import { FormPageShell } from "@/components/layout/FormPageShell";
import { MemberCreatePlaceForm } from "@/components/manage/OwnerPlaceForm";

export const metadata: Metadata = {
  title: "Add location | Dharma Atlas",
  robots: { index: false, follow: false },
};

export default function NewMemberPlacePage() {
  return (
    <FormPageShell
      title="Add a location"
      description="Tell us about your center. We'll review the listing before publishing."
      embedded
      backHref="/manage"
      backLabel="Back to Place Listings"
    >
      <MemberCreatePlaceForm />
    </FormPageShell>
  );
}
