"use client";

import Link from "next/link";
import { useState } from "react";
import { IdentificationCard, MapPinPlus } from "@phosphor-icons/react";
import { CorrectionForm } from "@/components/add/CorrectionForm";
import { submitButtonClassName } from "@/components/forms/FormField";
import { FormPageShell } from "@/components/layout/FormPageShell";
import { authClient } from "@/lib/auth-client";

const MANAGE_NEW_PATH = "/manage/places/new";
const SUGGEST_PATH = "/submit?type=location";

const optionIconClassName =
  "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand";

export function AddPlacePageView() {
  const { data: session, isPending } = authClient.useSession();
  const [managing, setManaging] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);

  if (managing) {
    const authRedirect = encodeURIComponent(MANAGE_NEW_PATH);

    return (
      <FormPageShell
        title="Manage this place"
        description="Create an account (or sign in) to add the place and become its admin. You’ll edit details, hours, and tags from your Place Listings dashboard. New places stay in draft until we publish them."
        backHref="/add"
        backLabel="Back to options"
      >
        <div className="space-y-4 rounded-2xl border border-border bg-surface-elevated p-6">
          {isPending ? (
            <p className="text-sm text-ink-secondary">Loading…</p>
          ) : session ? (
            <div className="flex flex-wrap gap-3">
              <Link href={MANAGE_NEW_PATH} className={submitButtonClassName}>
                Add new location
              </Link>
              <Link
                href="/manage/claim"
                className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted"
              >
                Claim an existing listing
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/signup?redirect=${authRedirect}`}
                  className={submitButtonClassName}
                >
                  Create account
                </Link>
                <Link
                  href={`/login?redirect=${authRedirect}`}
                  className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted"
                >
                  Sign in
                </Link>
              </div>
              <p className="text-sm text-ink-secondary">
                Already in the directory?{" "}
                <Link href="/claim" className="font-medium text-brand hover:underline">
                  Claim it
                </Link>{" "}
                after you sign in.
              </p>
            </>
          )}
        </div>
      </FormPageShell>
    );
  }

  return (
    <FormPageShell
      title="Add a place"
      description="Are you representing this place, or just suggesting it for the directory?"
    >
      <div className="space-y-3" role="list">
        <button
          type="button"
          role="listitem"
          onClick={() => setManaging(true)}
          className="flex w-full items-start gap-4 rounded-2xl border border-border bg-surface-elevated px-5 py-5 text-left transition hover:border-border-strong hover:bg-surface-muted"
        >
          <span className={optionIconClassName}>
            <IdentificationCard size={22} weight="duotone" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-lg font-semibold text-ink">
              I represent this place
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-ink-secondary">
              Create an account and become the admin so you can manage the listing.
            </span>
          </span>
        </button>

        <Link
          href={SUGGEST_PATH}
          role="listitem"
          className="flex w-full items-start gap-4 rounded-2xl border border-border bg-surface-elevated px-5 py-5 text-left transition hover:border-border-strong hover:bg-surface-muted"
        >
          <span className={optionIconClassName}>
            <MapPinPlus size={22} weight="duotone" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-lg font-semibold text-ink">
              Suggest a listing
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-ink-secondary">
              Tip us about a place without creating an account or claiming ownership.
            </span>
          </span>
        </Link>
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <p className="text-sm leading-relaxed text-ink-secondary">
          Did you want to make a correction to an existing location or person?
        </p>
        {showCorrection ? (
          <div className="mt-4">
            <CorrectionForm />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCorrection(true)}
            className="mt-3 text-sm font-medium text-brand hover:underline"
          >
            Suggest a correction
          </button>
        )}
      </div>
    </FormPageShell>
  );
}
