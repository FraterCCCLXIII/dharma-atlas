import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin sign in | Dharma Atlas",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            Dharma Atlas
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl font-semibold">
            Admin sign in
          </h1>
        </div>
        <AdminLoginForm redirectTo={redirectTo ?? "/admin"} />
      </div>
    </div>
  );
}
