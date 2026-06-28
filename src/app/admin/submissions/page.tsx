import { getSubmissions } from "@/lib/data/submissions";
import { SubmissionsAdminList } from "@/components/admin/SubmissionsAdminList";

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filterStatus =
    status === "approved" || status === "rejected" || status === "pending"
      ? status
      : undefined;

  const submissions = await getSubmissions(filterStatus);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold">
        Submissions
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Review public suggestions before publishing to the directory.
      </p>

      <SubmissionsAdminList submissions={submissions} currentStatus={filterStatus ?? "all"} />
    </div>
  );
}
