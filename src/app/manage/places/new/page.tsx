import type { Metadata } from "next";
import { MemberCreatePlaceForm } from "@/components/manage/OwnerPlaceForm";

export const metadata: Metadata = {
  title: "Add location | Dharma Atlas",
  robots: { index: false, follow: false },
};

export default function NewMemberPlacePage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">
        Add a location
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Tell us about your center. We&apos;ll review the listing before publishing.
      </p>
      <div className="mt-8">
        <MemberCreatePlaceForm />
      </div>
    </div>
  );
}
