import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Create account | Dharma Streams",
  robots: { index: false, follow: false },
};

export default async function SignupPage({
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
            Dharma Streams
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl font-semibold">
            Create account
          </h1>
          <p className="mt-2 text-sm text-ink-secondary">
            Free account to claim or add your center to the directory.
          </p>
        </div>
        <AuthForm
          mode="signup"
          redirectTo={redirectTo ?? "/manage"}
          alternateHref={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          alternateLabel="Already have an account? Sign in"
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
