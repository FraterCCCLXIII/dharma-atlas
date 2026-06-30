import Link from "next/link";
import { getAllTeachersForAdmin } from "@/lib/data/teachers";
import { TeachersAdminSearch } from "@/components/admin/TeachersAdminSearch";

export default async function AdminTeachersPage() {
  const teachers = await getAllTeachersForAdmin();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            Teachers
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{teachers.length} in the directory</p>
        </div>
        <Link
          href="/admin/teachers/new"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
        >
          + Add teacher
        </Link>
      </div>

      <TeachersAdminSearch teachers={teachers} />
    </div>
  );
}
