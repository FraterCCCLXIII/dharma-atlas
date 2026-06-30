import type { Metadata } from "next";
import { OntologyRuntimeProvider } from "@/components/explore/OntologyRuntimeProvider";
import { ManageShell } from "@/components/manage/ManageShell";
import { getSession } from "@/lib/auth-server";
import { getOntologySnapshot } from "@/lib/data/ontology";
import { serializeOntologySnapshot } from "@/lib/ontology/build-snapshot";

export const metadata: Metadata = {
  title: "Manage | Dharma Streams",
  robots: { index: false, follow: false },
};

export default async function ManageLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    return <>{children}</>;
  }

  const ontology = await getOntologySnapshot();

  return (
    <OntologyRuntimeProvider ontology={serializeOntologySnapshot(ontology)}>
      <ManageShell userEmail={session.user.email}>{children}</ManageShell>
    </OntologyRuntimeProvider>
  );
}
