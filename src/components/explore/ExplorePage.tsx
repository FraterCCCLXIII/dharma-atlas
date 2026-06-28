import { ExplorePageClient } from "@/components/explore/ExplorePageClient";
import { OntologyRuntimeProvider } from "@/components/explore/OntologyRuntimeProvider";
import { getAllPlaces } from "@/lib/data/places";
import { getAllTeachers } from "@/lib/data/teachers";
import { getOntologySnapshot } from "@/lib/data/ontology";
import { serializeOntologySnapshot } from "@/lib/ontology/build-snapshot";

export const dynamic = "force-dynamic";

export async function ExplorePage() {
  const [places, teachers, ontology] = await Promise.all([
    getAllPlaces(),
    getAllTeachers(),
    getOntologySnapshot(),
  ]);

  return (
    <OntologyRuntimeProvider ontology={serializeOntologySnapshot(ontology)}>
      <ExplorePageClient places={places} teachers={teachers} />
    </OntologyRuntimeProvider>
  );
}
