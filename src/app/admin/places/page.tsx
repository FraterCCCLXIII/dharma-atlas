import Link from "next/link";
import { Suspense } from "react";
import { PlacesAdminSearch } from "@/components/admin/PlacesAdminSearch";
import { searchPlaces } from "@/lib/data/places";

export default async function AdminPlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; flag?: string }>;
}) {
  const { q = "", page: pageStr = "1", flag = "" } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const { places, total, pageSize } = await searchPlaces({
    query: q,
    page,
    pageSize: 50,
    qualityFlag: flag || undefined,
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            Locations
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{total} in the directory</p>
        </div>
        <Link
          href="/admin/places/new"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
        >
          + Add location
        </Link>
      </div>

      <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}>
        <PlacesAdminSearch
          places={places}
          total={total}
          page={page}
          pageSize={pageSize}
          initialQuery={q}
          initialFlag={flag}
        />
      </Suspense>
    </div>
  );
}
