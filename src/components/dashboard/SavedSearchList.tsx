"use client";

import { useState } from "react";

interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  createdAt: string;
}

interface Props {
  initialSearches: SavedSearch[];
}

function describeFilters(filters: Record<string, unknown>): string {
  const parts: string[] = [];
  if (filters.transactionType)
    parts.push(filters.transactionType === "RENT" ? "Location" : "Vente");
  if (filters.propertyType) parts.push(String(filters.propertyType).toLowerCase());
  if (filters.wilayaCode) parts.push(`wilaya ${filters.wilayaCode}`);
  if (filters.priceMin) parts.push(`≥ ${filters.priceMin} DA`);
  if (filters.priceMax) parts.push(`≤ ${filters.priceMax} DA`);
  if (filters.surfaceMin) parts.push(`≥ ${filters.surfaceMin} m²`);
  if (filters.rooms) parts.push(`${filters.rooms}+ pièces`);
  return parts.join(" · ") || "Tous les biens";
}

export default function SavedSearchList({ initialSearches }: Props) {
  const [searches, setSearches] = useState(initialSearches);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cette alerte ?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/saved-searches/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSearches((prev) => prev.filter((s) => s.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  };

  if (searches.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-300">
          notifications_off
        </span>
        <p className="text-gray-500 mt-4">
          Aucune alerte enregistrée. Utilisez le bouton « Créer une alerte » sur la page de recherche.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {searches.map((s) => (
        <li
          key={s.id}
          className="rounded-2xl border border-gray-100 bg-white p-5 flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <div className="font-bold text-gray-900 truncate">{s.name}</div>
            <div className="text-sm text-gray-500 truncate">
              {describeFilters(s.filters)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Créée le{" "}
              {new Date(s.createdAt).toLocaleDateString("fr-DZ", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
          <button
            onClick={() => handleDelete(s.id)}
            disabled={deleting === s.id}
            className="flex-shrink-0 text-sm font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            {deleting === s.id ? "..." : "Supprimer"}
          </button>
        </li>
      ))}
    </ul>
  );
}
