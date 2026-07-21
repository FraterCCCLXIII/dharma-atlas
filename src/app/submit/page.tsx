import type { Metadata } from "next";
import { getOntologySnapshot } from "@/lib/data/ontology";
import { serializeOntologySnapshot } from "@/lib/ontology/build-snapshot";
import { SubmitEntryPageClient } from "@/components/submit/SubmitEntryPageClient";

// Reads the ontology from the DB at render. Keep it dynamic so it is not
// prerendered during `next build` (the Docker build has no DB — see Dockerfile),
// which the root layout's force-dynamic used to guarantee implicitly.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Submit an entry | Dharma Atlas",
  description:
    "Suggest a meditation center, monastery, or teacher for the Dharma Atlas directory.",
};

export default async function SubmitPage() {
  const ontology = await getOntologySnapshot();

  return <SubmitEntryPageClient ontology={serializeOntologySnapshot(ontology)} />;
}
