import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { OntologyRuntimeProvider } from "@/components/explore/OntologyRuntimeProvider";
import { getSession } from "@/lib/auth-server";
import { getPendingClaimsCount } from "@/lib/data/claims";
import { getDraftPlacesCount } from "@/lib/data/places";
import { getPendingReportsCount } from "@/lib/data/reports";
import {
  getPendingLocationSubmissionsCount,
  getPendingSubmissionsCount,
} from "@/lib/data/submissions";
import { getOntologySnapshot } from "@/lib/data/ontology";
import { serializeOntologySnapshot } from "@/lib/ontology/build-snapshot";
import { isAdminRole } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Admin | Dharma Atlas",
  robots: { index: false, follow: false },
};

// Docker/Coolify builds have no database. Without this, Next tries to
// prerender admin pages (e.g. /admin/location-reviews) against 127.0.0.1:5432.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isLoginRoute = pathname === "/admin/login";

  const session = await getSession();

  if (!session) {
    return <>{children}</>;
  }

  if (!isLoginRoute && !isAdminRole(session.user.role)) {
    redirect("/");
  }

  if (isLoginRoute) {
    return <>{children}</>;
  }

  const [
    pendingSubmissions,
    pendingClaims,
    pendingReports,
    draftPlaces,
    pendingLocationSuggestions,
    ontology,
  ] = await Promise.all([
    getPendingSubmissionsCount(),
    getPendingClaimsCount(),
    getPendingReportsCount(),
    getDraftPlacesCount(),
    getPendingLocationSubmissionsCount(),
    getOntologySnapshot(),
  ]);

  return (
    <OntologyRuntimeProvider ontology={serializeOntologySnapshot(ontology)}>
      <AdminShell
        pendingSubmissions={pendingSubmissions}
        pendingClaims={pendingClaims}
        pendingReports={pendingReports}
        pendingLocationReviews={draftPlaces + pendingLocationSuggestions}
        userEmail={session.user.email}
        isOwner={session.user.role === "owner"}
      >
        {children}
      </AdminShell>
    </OntologyRuntimeProvider>
  );
}
