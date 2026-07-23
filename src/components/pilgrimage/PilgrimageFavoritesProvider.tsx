"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getPilgrimageFavoriteKeys,
  setPilgrimageFavorite,
} from "@/app/actions/pilgrimage-favorites";
import {
  pilgrimageFavoriteKey,
  type PilgrimageFavoriteKind,
} from "@/lib/pilgrimage-favorite-key";
import { authClient } from "@/lib/auth-client";

interface PilgrimageFavoritesContextValue {
  sessionPending: boolean;
  isLoggedIn: boolean;
  statusLoaded: boolean;
  isFavorited: (kind: PilgrimageFavoriteKind, slug: string) => boolean;
  setFavorited: (
    kind: PilgrimageFavoriteKind,
    slug: string,
    favorited: boolean,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}

const PilgrimageFavoritesContext =
  createContext<PilgrimageFavoritesContextValue | null>(null);

export function PilgrimageFavoritesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [statusLoaded, setStatusLoaded] = useState(false);
  const isLoggedIn = Boolean(session?.user);

  useEffect(() => {
    if (sessionPending) return;

    if (!session?.user) {
      setKeys(new Set());
      setStatusLoaded(true);
      return;
    }

    let cancelled = false;
    setStatusLoaded(false);

    void getPilgrimageFavoriteKeys().then((favoriteKeys) => {
      if (cancelled) return;
      setKeys(new Set(favoriteKeys));
      setStatusLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [session?.user, sessionPending]);

  const value: PilgrimageFavoritesContextValue = {
    sessionPending,
    isLoggedIn,
    statusLoaded,
    isFavorited: (kind, slug) =>
      keys.has(pilgrimageFavoriteKey(kind, slug)),
    setFavorited: async (kind, slug, favorited) => {
      const key = pilgrimageFavoriteKey(kind, slug);
      setKeys((prev) => {
        const next = new Set(prev);
        if (favorited) next.add(key);
        else next.delete(key);
        return next;
      });

      const result = await setPilgrimageFavorite(kind, slug, favorited);
      if (!result.ok) {
        setKeys((prev) => {
          const next = new Set(prev);
          if (favorited) next.delete(key);
          else next.add(key);
          return next;
        });
        return { ok: false, error: result.error };
      }

      return { ok: true };
    },
  };

  return (
    <PilgrimageFavoritesContext.Provider value={value}>
      {children}
    </PilgrimageFavoritesContext.Provider>
  );
}

export function usePilgrimageFavorites(): PilgrimageFavoritesContextValue {
  const value = useContext(PilgrimageFavoritesContext);
  if (!value) {
    throw new Error(
      "usePilgrimageFavorites must be used within PilgrimageFavoritesProvider",
    );
  }
  return value;
}
