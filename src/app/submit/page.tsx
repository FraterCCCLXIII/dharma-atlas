import type { Metadata } from "next";
import { getOntologySnapshot } from "@/lib/data/ontology";
import { serializeOntologySnapshot } from "@/lib/ontology/build-snapshot";
import { SubmitEntryPageClient } from "@/components/submit/SubmitEntryPageClient";

export const metadata: Metadata = {
  title: "Submit an entry | Dharma Atlas",
  description:
    "Suggest a meditation center, monastery, or teacher for the Dharma Atlas directory.",
};

export default async function SubmitPage() {
  const ontology = await getOntologySnapshot();

  return <SubmitEntryPageClient ontology={serializeOntologySnapshot(ontology)} />;
}
