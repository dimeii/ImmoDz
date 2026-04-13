"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/components/providers/FavoritesProvider";

type Variant = "card" | "detail";

export default function FavoriteButton({
  listingId,
  variant = "card",
}: {
  listingId: string;
  variant?: Variant;
}) {
  const { status } = useSession();
  const router = useRouter();
  const { isFavorite, toggle } = useFavorites();
  const favorite = isFavorite(listingId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    toggle(listingId);
  };

  if (variant === "detail") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
          favorite
            ? "bg-red-50 text-red-600 hover:bg-red-100"
            : "bg-surface-container hover:bg-surface-container-high text-primary"
        }`}
        aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        aria-pressed={favorite}
      >
        <span
          className="material-symbols-outlined text-base"
          style={favorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          favorite
        </span>
        {favorite ? "Enregistré" : "Enregistrer"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`absolute top-2 left-2 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors shadow-sm ${
        favorite
          ? "bg-white/95 text-red-600 hover:bg-white"
          : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-600"
      }`}
      aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={favorite}
    >
      <span
        className="material-symbols-outlined text-[20px]"
        style={favorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        favorite
      </span>
    </button>
  );
}
