"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PencilSimple } from "@phosphor-icons/react";
import { AuthModal } from "@/components/auth/AuthModal";
import { PilgrimageFavoriteButton } from "@/components/pilgrimage/PilgrimageFavoriteButton";
import { PilgrimageShareButton } from "@/components/pilgrimage/PilgrimageShareButton";
import { pilgrimageRoutePath } from "@/data/pilgrimage";
import { authClient } from "@/lib/auth-client";

export function PilgrimageRouteActions({
  slug,
  name,
  summary,
}: {
  slug: string;
  name: string;
  summary: string;
}) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const customizePath = `${pilgrimageRoutePath(slug)}/customize`;

  function handleCustomize() {
    if (sessionPending) return;
    if (!session?.user) {
      setAuthOpen(true);
      return;
    }
    router.push(customizePath);
  }

  function handleAuthSuccess() {
    setAuthOpen(false);
    router.push(customizePath);
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <PilgrimageFavoriteButton kind="route" slug={slug} />
      <PilgrimageShareButton title={name} text={summary} />
      <button
        type="button"
        onClick={handleCustomize}
        disabled={sessionPending}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink disabled:opacity-60"
      >
        <PencilSimple size={16} weight="bold" />
        <span className="hidden sm:inline">Customize</span>
      </button>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        redirectTo={customizePath}
        title="Customize this route"
        description="Create an account or sign in to fork and edit this pilgrimage."
        initialMode="signup"
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
