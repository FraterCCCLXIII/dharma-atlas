"use client";

import { useState } from "react";
import { approveSubmissionAction } from "@/app/admin/actions/submissions";

interface ApproveLocationSubmissionFormProps {
  submissionId: number;
}

export function ApproveLocationSubmissionForm({
  submissionId,
}: ApproveLocationSubmissionFormProps) {
  const [autoPublish, setAutoPublish] = useState(true);

  return (
    <form action={approveSubmissionAction} className="space-y-2">
      <input type="hidden" name="id" value={submissionId} />
      <input type="hidden" name="autoPublish" value={autoPublish ? "1" : "0"} />
      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 transition hover:bg-surface-muted/40">
        <input
          type="checkbox"
          checked={autoPublish}
          onChange={(e) => setAutoPublish(e.target.checked)}
          className="mt-0.5 rounded border-border text-brand focus:ring-brand/30"
        />
        <span>
          <span className="block text-xs font-medium text-ink">Publish immediately</span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-muted">
            On by default. Turn off to create a draft for further review first.
          </span>
        </span>
      </label>
      <button
        type="submit"
        className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:opacity-90"
      >
        {autoPublish ? "Approve & publish" : "Approve & create draft"}
      </button>
    </form>
  );
}
