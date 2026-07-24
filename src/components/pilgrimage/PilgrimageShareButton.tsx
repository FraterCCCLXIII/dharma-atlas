"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  CaretDown,
  Check,
  EnvelopeSimple,
  FacebookLogo,
  Link as LinkIcon,
  LinkedinLogo,
  ShareNetwork,
  WhatsappLogo,
  XLogo,
} from "@phosphor-icons/react";

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
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function resolveUrl(): string {
    if (url?.startsWith("http")) return url;
    if (typeof window === "undefined") return url ?? "";
    if (url) return new URL(url, window.location.origin).toString();
    return window.location.href;
  }

  function shareText(): string {
    return text?.trim() || title;
  }

  function copyLink() {
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(resolveUrl());
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        // Ignore clipboard failures.
      }
    });
  }

  function nativeShare() {
    startTransition(async () => {
      try {
        await navigator.share({
          title,
          text: shareText(),
          url: resolveUrl(),
        });
        setOpen(false);
      } catch {
        // Cancelled or unavailable.
      }
    });
  }

  function openExternal(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  const buttonClassName =
    variant === "icon"
      ? "inline-flex items-center justify-center rounded-full border border-border p-2 text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink disabled:opacity-60"
      : "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink disabled:opacity-60";

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={pending}
        aria-label={`Share ${title}`}
        aria-expanded={open}
        aria-haspopup="menu"
        className={buttonClassName}
      >
        <ShareNetwork size={16} weight="bold" />
        {variant === "pill" ? (
          <>
            <span className="hidden sm:inline">
              {copied ? "Link copied" : "Share"}
            </span>
            <CaretDown
              size={12}
              weight="bold"
              className={`hidden text-ink-muted transition sm:block ${open ? "rotate-180" : ""}`}
            />
          </>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={`Share options for ${title}`}
          className="absolute left-0 top-full z-40 mt-2 min-w-[13.5rem] overflow-hidden rounded-xl border border-border bg-surface-elevated py-1 shadow-[var(--shadow-float)]"
        >
          <MenuItem
            icon={
              copied ? (
                <Check size={16} weight="bold" className="text-brand" />
              ) : (
                <LinkIcon size={16} weight="bold" />
              )
            }
            label={copied ? "Link copied" : "Copy link"}
            onClick={copyLink}
          />
          {canNativeShare ? (
            <MenuItem
              icon={<ShareNetwork size={16} weight="bold" />}
              label="Share via device…"
              onClick={nativeShare}
            />
          ) : null}
          <div className="my-1 border-t border-border" role="separator" />
          <MenuItem
            icon={<EnvelopeSimple size={16} weight="bold" />}
            label="Email"
            onClick={() => {
              const shareUrl = resolveUrl();
              openExternal(
                `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText()}\n\n${shareUrl}`)}`,
              );
            }}
          />
          <MenuItem
            icon={<XLogo size={16} weight="bold" />}
            label="X / Twitter"
            onClick={() => {
              const shareUrl = resolveUrl();
              openExternal(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText())}&url=${encodeURIComponent(shareUrl)}`,
              );
            }}
          />
          <MenuItem
            icon={<FacebookLogo size={16} weight="bold" />}
            label="Facebook"
            onClick={() => {
              openExternal(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resolveUrl())}`,
              );
            }}
          />
          <MenuItem
            icon={<WhatsappLogo size={16} weight="bold" />}
            label="WhatsApp"
            onClick={() => {
              const shareUrl = resolveUrl();
              openExternal(
                `https://wa.me/?text=${encodeURIComponent(`${shareText()} ${shareUrl}`)}`,
              );
            }}
          />
          <MenuItem
            icon={<LinkedinLogo size={16} weight="bold" />}
            label="LinkedIn"
            onClick={() => {
              openExternal(
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(resolveUrl())}`,
              );
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
    >
      <span className="shrink-0 text-ink-muted">{icon}</span>
      {label}
    </button>
  );
}
