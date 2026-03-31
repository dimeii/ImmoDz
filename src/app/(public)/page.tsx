"use client";

import { useState, useCallback } from "react";
import MapView from "@/components/map/MapView";
import AnnonceList from "@/components/annonces/AnnonceList";
import SearchFilters from "@/components/ui/SearchFilters";

type ViewMode = "map" | "list";

export default function HomePage() {
  const [filters, setFilters] = useState<Record<string, string>>({
    transactionType: "RENT",
  });
  const [view, setView] = useState<ViewMode>("map");

  const handleFiltersChange = useCallback(
    (newFilters: Record<string, string>) => {
      setFilters(newFilters);
    },
    []
  );

  return (
    <main className="flex h-[calc(100vh-57px)]">
      {/* Sidebar filtres */}
      <aside className="w-80 shrink-0 overflow-y-auto border-r bg-gray-50 p-4">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Rechercher un bien
        </h2>
        <SearchFilters onFiltersChange={handleFiltersChange} />
      </aside>

      {/* Zone principale */}
      <div className="flex flex-1 flex-col">
        {/* Toggle carte / liste */}
        <div className="flex items-center justify-between border-b bg-white px-4 py-2">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "map"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 6.75V15m6-6v8.25m.503-14.032a22.373 22.373 0 0 0-6.006 0C8.09 3.394 7 4.587 7 5.942v12.116c0 1.355 1.09 2.548 2.497 2.724a22.373 22.373 0 0 0 6.006 0C16.91 20.606 18 19.413 18 18.058V5.942c0-1.355-1.09-2.548-2.497-2.724Z"
                />
              </svg>
              Carte
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              Liste
            </button>
          </div>
        </div>

        {/* Contenu : carte ou liste */}
        <div className="flex-1 overflow-hidden">
          {view === "map" ? (
            <MapView filters={filters} />
          ) : (
            <div className="h-full overflow-y-auto p-4">
              <AnnonceList filters={filters} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
