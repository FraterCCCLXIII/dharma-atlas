import { ExplorePageClient } from "@/components/explore/ExplorePageClient";
import { OntologyRuntimeProvider } from "@/components/explore/OntologyRuntimeProvider";
import { getOntologySnapshot } from "@/lib/data/ontology";
import { serializeOntologySnapshot } from "@/lib/ontology/build-snapshot";
import { setOntologySnapshot } from "@/lib/schools";

export const dynamic = "force-dynamic";

type ExplorePageProps = {
  /** Kept for call sites (`/places`, `/people`); entity scope comes from the path client-side. */
  mode?: "all" | "locations" | "people";
};

export async function ExplorePage(_props: ExplorePageProps = {}) {
  const ontology = await getOntologySnapshot();
  setOntologySnapshot(ontology);

  return (
    <OntologyRuntimeProvider ontology={serializeOntologySnapshot(ontology)}>
      <ExplorePageClient />
    </OntologyRuntimeProvider>
  );
}
