import { OntologyEditor } from "@/components/admin/OntologyEditor";
import { getAllOntologyNodes, seedOntologyIfEmpty } from "@/lib/data/ontology";

export default async function AdminOntologyPage() {
  await seedOntologyIfEmpty();
  const nodes = await getAllOntologyNodes();

  return <OntologyEditor initialNodes={nodes} />;
}
