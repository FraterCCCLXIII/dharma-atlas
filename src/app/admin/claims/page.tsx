import { getClaims } from "@/lib/data/claims";
import { ClaimsAdminList } from "@/components/admin/ClaimsAdminList";

export default async function AdminClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filterStatus =
    status === "approved" || status === "rejected" || status === "pending"
      ? status
      : undefined;

  const claims = await getClaims(filterStatus);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold">Claims</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Review affiliation requests before granting edit access to center representatives.
      </p>

      <ClaimsAdminList claims={claims} currentStatus={filterStatus ?? "all"} />
    </div>
  );
}
