import { ExplorePageClient } from "@/components/explore/ExplorePageClient";
import { OntologyRuntimeProvider } from "@/components/explore/OntologyRuntimeProvider";
import { getAllTeachers } from "@/lib/data/teachers";
import { getOntologySnapshot } from "@/lib/data/ontology";
import { serializeOntologySnapshot } from "@/lib/ontology/build-snapshot";
import { setOntologySnapshot } from "@/lib/schools";
import type { EntityFilter } from "@/store/explore-store";

export const dynamic = "force-dynamic";

type ExplorePageProps = {
  /** Places browse doesn't need the full teacher payload (~teachers inflate HTML). */
  mode?: Exclude<EntityFilter, "all"> | "all";
};

export async function ExplorePage({ mode = "all" }: ExplorePageProps) {
  const [teachers, ontology] = await Promise.all([
    mode === "locations" ? Promise.resolve([]) : getAllTeachers(),
    getOntologySnapshot(),
  ]);

  setOntologySnapshot(ontology);

  return (
    <OntologyRuntimeProvider ontology={serializeOntologySnapshot(ontology)}>
      <ExplorePageClient teachers={teachers} />
    </OntologyRuntimeProvider>
  );
}
