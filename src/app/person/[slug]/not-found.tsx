import Link from "next/link";
import { PEOPLE_LIST_PATH } from "@/lib/explore-routes";

export default function PersonNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-6 text-center">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Person not found
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        This profile may have moved or is not in the directory yet.
      </p>
      <Link
        href={PEOPLE_LIST_PATH}
        className="mt-6 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
      >
        Browse people
      </Link>
    </div>
  );
}
