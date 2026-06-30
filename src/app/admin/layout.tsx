import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { OntologyRuntimeProvider } from "@/components/explore/OntologyRuntimeProvider";
import { getSession } from "@/lib/auth-server";
import { getPendingClaimsCount } from "@/lib/data/claims";
import { getPendingReportsCount } from "@/lib/data/reports";
import { getPendingSubmissionsCount } from "@/lib/data/submissions";
import { getOntologySnapshot } from "@/lib/data/ontology";
import { serializeOntologySnapshot } from "@/lib/ontology/build-snapshot";

export const metadata: Metadata = {
  title: "Admin | Dharma Streams",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    return <>{children}</>;
  }

  const [pendingSubmissions, pendingClaims, pendingReports, ontology] = await Promise.all([
    getPendingSubmissionsCount(),
    getPendingClaimsCount(),
    getPendingReportsCount(),
    getOntologySnapshot(),
  ]);

  return (
    <OntologyRuntimeProvider ontology={serializeOntologySnapshot(ontology)}>
      <AdminShell
        pendingSubmissions={pendingSubmissions}
        pendingClaims={pendingClaims}
        pendingReports={pendingReports}
        userEmail={session.user.email}
      >
        {children}
      </AdminShell>
    </OntologyRuntimeProvider>
  );
}
