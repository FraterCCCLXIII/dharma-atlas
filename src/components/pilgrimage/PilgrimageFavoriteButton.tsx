"use client";

import { usePathname } from "next/navigation";
import { useState, useTransition, type MouseEvent } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { PlaceHeartIcon } from "@/components/place/PlaceHeartIcon";
import { usePilgrimageFavorites } from "@/components/pilgrimage/PilgrimageFavoritesProvider";
import type { PilgrimageFavoriteKind } from "@/lib/pilgrimage-favorite-key";

type FavoriteVariant = "pill" | "overlay" | "icon";

interface PilgrimageFavoriteButtonProps {
  kind: PilgrimageFavoriteKind;
  slug: string;
  variant?: FavoriteVariant;
  redirectTo?: string;
}

export function PilgrimageFavoriteButton({
  kind,
  slug,
  variant = "pill",
  redirectTo,
}: PilgrimageFavoriteButtonProps) {
  const pathname = usePathname();
  const {
    sessionPending,
    isLoggedIn,
    statusLoaded,
    isFavorited,
    setFavorited,
  } = usePilgrimageFavorites();
  const [authOpen, setAuthOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const favorited = isFavorited(kind, slug);
  const noun = kind === "route" ? "route" : "site";
  const authRedirect = redirectTo ?? pathname ?? `/pilgrimage/${kind === "route" ? "routes" : "sites"}/${slug}`;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (sessionPending || pending) return;

    if (!isLoggedIn) {
      setAuthOpen(true);
      return;
    }

    const next = !favorited;
    startTransition(async () => {
      const result = await setFavorited(kind, slug, next);
      if (!result.ok && result.error.toLowerCase().includes("sign in")) {
        setAuthOpen(true);
      }
    });
  }

  async function handleAuthSuccess() {
    await setFavorited(kind, slug, true);
    setAuthOpen(false);
  }

  const label = favorited ? "Saved" : "Save";
  const disabled =
    sessionPending || (isLoggedIn && !statusLoaded) || pending;

  const buttonClassName =
    variant === "overlay"
      ? `inline-flex items-center justify-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] transition hover:scale-105 disabled:opacity-60 ${
          favorited ? "text-rose-300" : ""
        }`
      : variant === "icon"
        ? `inline-flex items-center justify-center rounded-full border border-border p-2 text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink disabled:opacity-60 ${
            favorited ? "text-rose-600" : ""
          }`
        : "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink disabled:opacity-60";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-pressed={favorited}
        aria-label={
          favorited
            ? `Remove ${noun} from saved`
            : `Save this ${noun}`
        }
        className={buttonClassName}
      >
        <PlaceHeartIcon
          size={variant === "overlay" ? 24 : 16}
          filled={favorited}
          darkCenter={variant === "overlay" && !favorited}
          className={
            favorited
              ? variant === "overlay"
                ? "text-rose-300"
                : "text-rose-600"
              : undefined
          }
        />
        {variant === "pill" ? (
          <span className="hidden sm:inline">{label}</span>
        ) : null}
      </button>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        redirectTo={authRedirect}
        title={`Save this ${noun}`}
        description={`Create an account or sign in to heart pilgrimage ${noun}s you want to come back to.`}
        initialMode="signup"
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
