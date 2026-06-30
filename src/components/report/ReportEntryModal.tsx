"use client";

import { Flag, ShareNetwork, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { fieldClassName, FormField, submitButtonClassName } from "@/components/forms/FormField";
import {
  locationReportReasons,
  reportReasonLabel,
  teacherReportReasons,
} from "@/lib/report-reasons";

type ReportEntityType = "location" | "teacher";

interface ReportEntryModalProps {
  open: boolean;
  onClose: () => void;
  entityType: ReportEntityType;
  entityId: string;
  entityName: string;
  entityPath: string;
}

export function ReportEntryModal({
  open,
  onClose,
  entityType,
  entityId,
  entityName,
  entityPath,
}: ReportEntryModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reasons =
    entityType === "location" ? locationReportReasons : teacherReportReasons;

  useEffect(() => {
    if (!open) return;

    setReason("");
    setDetails("");
    setEmail("");
    setError("");
    setSubmitting(false);
    setSubmitted(false);
  }, [open, entityId]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable?.[0];
    first?.focus();

    const trapFocus = (event: FocusEvent) => {
      if (!dialogRef.current?.contains(event.target as Node) && focusable?.length) {
        first?.focus();
      }
    };
    document.addEventListener("focusin", trapFocus);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", trapFocus);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          entityName,
          entityPath,
          reason,
          details,
          submitterEmail: email,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Report failed");
      }

      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Report failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close report dialog"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-6 shadow-[var(--shadow-float)]"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="font-[family-name:var(--font-fraunces)] text-xl font-semibold">
              Report an issue
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {entityName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-muted transition hover:bg-surface-muted hover:text-ink"
            aria-label="Close"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {submitted ? (
          <p className="text-sm leading-relaxed text-ink-secondary">
            Thank you. We&apos;ve received your report and will review it soon.
          </p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField id="report-reason" label="What's wrong?">
              <select
                id="report-reason"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={fieldClassName}
              >
                <option value="" disabled>
                  Select a reason
                </option>
                {reasons.map((value) => (
                  <option key={value} value={value}>
                    {reportReasonLabel(entityType, value)}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="report-details" label="Details">
              <textarea
                id="report-details"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required={reason === "other"}
                className={`${fieldClassName} resize-y`}
                placeholder={
                  reason === "other"
                    ? "Describe the issue"
                    : "Optional — add context or corrections"
                }
              />
            </FormField>

            <FormField id="report-email" label="Your email">
              <input
                id="report-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClassName}
                placeholder="you@example.com"
              />
            </FormField>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className={submitButtonClassName}>
              {submitting ? "Submitting…" : "Submit report"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

interface DetailPageActionsProps {
  shareTitle: string;
  shareText?: string;
  entityType: ReportEntityType;
  entityId: string;
  entityName: string;
  entityPath: string;
  claimHref?: string;
}

export function DetailPageActions({
  shareTitle,
  shareText,
  entityType,
  entityId,
  entityName,
  entityPath,
  claimHref,
}: DetailPageActionsProps) {
  const [reportOpen, setReportOpen] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      void navigator.share({
        title: shareTitle,
        text: shareText,
        url: window.location.href,
      });
    } else {
      void navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      <div className="flex shrink-0 items-center gap-2 self-start">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink"
        >
          <ShareNetwork size={16} weight="bold" />
          <span className="hidden sm:inline">Share</span>
        </button>
        {claimHref && (
          <Link
            href={claimHref}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink"
          >
            <span className="hidden sm:inline">Claim</span>
            <span className="sm:hidden">Claim</span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink"
        >
          <Flag size={16} weight="bold" />
          <span className="hidden sm:inline">Report</span>
        </button>
      </div>

      <ReportEntryModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        entityType={entityType}
        entityId={entityId}
        entityName={entityName}
        entityPath={entityPath}
      />
    </>
  );
}
