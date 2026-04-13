"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSession } from "next-auth/react";

type FavoritesContextValue = {
  ids: Set<string>;
  isFavorite: (listingId: string) => boolean;
  toggle: (listingId: string) => Promise<void>;
  loading: boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setIds(new Set());
      return;
    }
    setLoading(true);
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.ids)) setIds(new Set(data.ids));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  const toggle = useCallback(
    async (listingId: string) => {
      if (status !== "authenticated") return;
      const wasFavorite = ids.has(listingId);

      setIds((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.delete(listingId);
        else next.add(listingId);
        return next;
      });

      try {
        await fetch("/api/favorites", {
          method: wasFavorite ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId }),
        });
      } catch {
        setIds((prev) => {
          const next = new Set(prev);
          if (wasFavorite) next.add(listingId);
          else next.delete(listingId);
          return next;
        });
      }
    },
    [ids, status]
  );

  const isFavorite = useCallback(
    (listingId: string) => ids.has(listingId),
    [ids]
  );

  return (
    <FavoritesContext.Provider value={{ ids, isFavorite, toggle, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    return {
      ids: new Set<string>(),
      isFavorite: () => false,
      toggle: async () => {},
      loading: false,
    };
  }
  return ctx;
}
