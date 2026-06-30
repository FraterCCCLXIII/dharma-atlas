import { getReports } from "@/lib/data/reports";
import { ReportsAdminList } from "@/components/admin/ReportsAdminList";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filterStatus =
    status === "reviewed" || status === "dismissed" || status === "pending"
      ? status
      : undefined;

  const reports = await getReports(filterStatus);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">
        Reports
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Issues reported on location and teacher listings.
      </p>

      <ReportsAdminList reports={reports} currentStatus={filterStatus ?? "all"} />
    </div>
  );
}
