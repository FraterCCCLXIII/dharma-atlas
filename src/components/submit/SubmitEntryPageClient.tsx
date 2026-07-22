"use client";

import { OntologyRuntimeProvider } from "@/components/explore/OntologyRuntimeProvider";
import type { SerializedOntologySnapshot } from "@/lib/ontology/build-snapshot";
import { SubmitEntryPageView } from "@/components/submit/SubmitEntryPageView";

export function SubmitEntryPageClient({
  ontology,
  initialEntryType,
}: {
  ontology: SerializedOntologySnapshot;
  initialEntryType?: "" | "location" | "teacher";
}) {
  return (
    <OntologyRuntimeProvider ontology={ontology}>
      <SubmitEntryPageView initialEntryType={initialEntryType} />
    </OntologyRuntimeProvider>
  );
}
