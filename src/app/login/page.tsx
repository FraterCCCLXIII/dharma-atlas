import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="flex min-h-dvh items-center justify-center bg-surface px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <SiteLogo variant="wordmark" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-ink-secondary">
            Manage your center&apos;s listing or continue a claim request.
          </p>
        </div>
        <AuthForm
          mode="signin"
          redirectTo={redirectTo ?? "/manage"}
          alternateHref={`/signup${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          alternateLabel="Create an account"
        />
        <p className="mt-6 text-center text-xs text-ink-muted">
          <Link href="/" className="hover:text-ink">
            Back to explore
          </Link>
        </p>
      </div>
    </div>
  );
}
