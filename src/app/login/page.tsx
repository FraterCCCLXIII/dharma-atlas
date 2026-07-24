import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { SiteLogo } from "@/components/layout/SiteLogo";

export const metadata: Metadata = {
  title: "Sign in | Dharma Atlas",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-surface px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <SiteLogo variant="wordmark" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-ink-secondary">
            Continue a claim, add a new location, or edit listings you manage.
          </p>
        </div>
        <AuthForm
          mode="signin"
          redirectTo={redirectTo ?? "/manage"}
          alternateHref={`/signup${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          alternateLabel="Create an account"
        />
      </div>
    </div>
  );
}
