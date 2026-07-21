import { ExplorePageClient } from "@/components/explore/ExplorePageClient";
import { OntologyRuntimeProvider } from "@/components/explore/OntologyRuntimeProvider";
import { getAllTeachers } from "@/lib/data/teachers";
import { getOntologySnapshot } from "@/lib/data/ontology";
import { serializeOntologySnapshot } from "@/lib/ontology/build-snapshot";
import { setOntologySnapshot } from "@/lib/schools";

export const dynamic = "force-dynamic";

export async function ExplorePage() {
  const [teachers, ontology] = await Promise.all([
    getAllTeachers(),
    getOntologySnapshot(),
  ]);

  setOntologySnapshot(ontology);

  return (
    <OntologyRuntimeProvider ontology={serializeOntologySnapshot(ontology)}>
      <ExplorePageClient teachers={teachers} />
    </OntologyRuntimeProvider>
  );
}
