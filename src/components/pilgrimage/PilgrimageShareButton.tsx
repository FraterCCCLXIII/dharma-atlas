"use client";

import { useState, useTransition } from "react";
import { ShareNetwork } from "@phosphor-icons/react";

interface PilgrimageShareButtonProps {
  title: string;
  text?: string;
  /** Absolute or path URL; defaults to current location. */
  url?: string;
  variant?: "pill" | "icon";
}

export function PilgrimageShareButton({
  title,
  text,
  url,
  variant = "pill",
}: PilgrimageShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function resolveUrl(): string {
    if (url?.startsWith("http")) return url;
    if (typeof window === "undefined") return url ?? "";
    if (url) return new URL(url, window.location.origin).toString();
    return window.location.href;
  }

  function handleShare() {
    startTransition(async () => {
      const shareUrl = resolveUrl();
      const payload = {
        title,
        text: text ?? title,
        url: shareUrl,
      };

      try {
        if (typeof navigator !== "undefined" && navigator.share) {
          await navigator.share(payload);
          return;
        }
      } catch {
        // User cancelled or share failed — fall through to clipboard.
      }

      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        // Ignore clipboard failures.
      }
    });
  }

  const label = copied ? "Link copied" : "Share";
  const className =
    variant === "icon"
      ? "inline-flex items-center justify-center rounded-full border border-border p-2 text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink disabled:opacity-60"
      : "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink disabled:opacity-60";

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={pending}
      aria-label={`Share ${title}`}
      className={className}
    >
      <ShareNetwork size={16} weight="bold" />
      {variant === "pill" ? (
        <span className="hidden sm:inline">{label}</span>
      ) : null}
    </button>
  );
}
