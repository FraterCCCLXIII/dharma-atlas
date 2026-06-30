"use client";

import { OntologyRuntimeProvider } from "@/components/explore/OntologyRuntimeProvider";
import type { SerializedOntologySnapshot } from "@/lib/ontology/build-snapshot";
import { SubmitEntryPageView } from "@/components/submit/SubmitEntryPageView";

export function SubmitEntryPageClient({
  ontology,
}: {
  ontology: SerializedOntologySnapshot;
}) {
  return (
    <OntologyRuntimeProvider ontology={ontology}>
      <SubmitEntryPageView />
    </OntologyRuntimeProvider>
  );
}
