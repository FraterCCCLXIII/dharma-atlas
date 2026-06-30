import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { SiteLogo } from "@/components/layout/SiteLogo";

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
          <div className="flex justify-center">
            <SiteLogo variant="wordmark" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold">
            Admin sign in
          </h1>
        </div>
        <AdminLoginForm redirectTo={redirectTo ?? "/admin"} />
      </div>
    </div>
  );
}
