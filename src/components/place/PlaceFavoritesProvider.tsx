"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getFavoritePlaceIds,
  setPlaceFavorite,
} from "@/app/actions/place-favorites";
import { authClient } from "@/lib/auth-client";

interface PlaceFavoritesContextValue {
  sessionPending: boolean;
  isLoggedIn: boolean;
  statusLoaded: boolean;
  isFavorited: (placeId: string) => boolean;
  setFavorited: (
    placeId: string,
    favorited: boolean,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}

const PlaceFavoritesContext = createContext<PlaceFavoritesContextValue | null>(
  null,
);

export function PlaceFavoritesProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [statusLoaded, setStatusLoaded] = useState(false);
  const isLoggedIn = Boolean(session?.user);

  useEffect(() => {
    if (sessionPending) return;

    if (!session?.user) {
      setIds(new Set());
      setStatusLoaded(true);
      return;
    }

    let cancelled = false;
    setStatusLoaded(false);

    void getFavoritePlaceIds().then((placeIds) => {
      if (cancelled) return;
      setIds(new Set(placeIds));
      setStatusLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [session?.user, sessionPending]);

  const value: PlaceFavoritesContextValue = {
    sessionPending,
    isLoggedIn,
    statusLoaded,
    isFavorited: (placeId) => ids.has(placeId),
    setFavorited: async (placeId, favorited) => {
      setIds((prev) => {
        const next = new Set(prev);
        if (favorited) next.add(placeId);
        else next.delete(placeId);
        return next;
      });

      const result = await setPlaceFavorite(placeId, favorited);
      if (!result.ok) {
        setIds((prev) => {
          const next = new Set(prev);
          if (favorited) next.delete(placeId);
          else next.add(placeId);
          return next;
        });
        return { ok: false, error: result.error };
      }

      return { ok: true };
    },
  };

  return (
    <PlaceFavoritesContext.Provider value={value}>
      {children}
    </PlaceFavoritesContext.Provider>
  );
}

export function usePlaceFavorites(): PlaceFavoritesContextValue {
  const value = useContext(PlaceFavoritesContext);
  if (!value) {
    throw new Error("usePlaceFavorites must be used within PlaceFavoritesProvider");
  }
  return value;
}
