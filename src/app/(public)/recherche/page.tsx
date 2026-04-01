"use client";

import { useState, useCallback } from "react";
import MapView, { PinProperties } from "@/components/map/MapView";
import AnnonceList from "@/components/annonces/AnnonceList";
import SearchFilters from "@/components/ui/SearchFilters";
import Link from "next/link";

type ViewMode = "map" | "list";

const propertyTypeLabels: Record<string, string> = {
  APARTMENT: "Appartement",
  HOUSE: "Maison",
  VILLA: "Villa",
  STUDIO: "Studio",
  LAND: "Terrain",
  COMMERCIAL: "Commercial",
  OFFICE: "Bureau",
  GARAGE: "Garage",
  OTHER: "Autre",
};

export default function RecherchePage() {
  const [filters, setFilters] = useState<Record<string, string>>({
    transactionType: "RENT",
  });
  const [view, setView] = useState<ViewMode>("map");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedListings, setSelectedListings] = useState<PinProperties[]>([]);

  const handleFiltersChange = useCallback(
    (newFilters: Record<string, string>) => {
      setFilters(newFilters);
    },
    []
  );

  const handlePinClick = useCallback((listings: PinProperties[]) => {
    setSelectedListings(listings);
  }, []);

  const closePanel = useCallback(() => {
    setSelectedListings([]);
  }, []);

  return (
    <main className="flex h-[calc(100vh-57px)]">
      {/* Sidebar filtres (gauche) */}
      <aside
        style={{
          width: sidebarOpen ? 320 : 0,
          minWidth: sidebarOpen ? 320 : 0,
          padding: sidebarOpen ? 24 : 0,
          borderRightWidth: sidebarOpen ? 4 : 0,
          transition: "all 300ms ease-in-out",
          overflow: "hidden",
        }}
        className="bg-white border-primary-950 overflow-y-auto shadow-lg"
      >
        <div style={{ width: 272, minWidth: 272 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-primary-950">Filtres</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-primary-50 rounded transition-colors"
              aria-label="Fermer les filtres"
            >
              <svg
                className="h-5 w-5 text-primary-950"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <SearchFilters onFiltersChange={handleFiltersChange} />
        </div>
      </aside>

      {/* Zone principale */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Barre d'outils */}
        <div className="flex items-center justify-between border-b bg-white px-4 py-3">
          {/* Bouton entonnoir */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`rounded-lg px-3 py-2 transition-colors flex items-center gap-2 text-sm font-semibold ${
              sidebarOpen
                ? "bg-primary-950 text-white"
                : "text-primary-950 hover:bg-primary-50"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
              />
            </svg>
            Filtres
          </button>

          {/* Toggle carte / liste */}
          <div className="flex rounded-lg bg-primary-50 p-1">
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "map"
                  ? "bg-white text-primary-950 shadow-md"
                  : "text-gray-500 hover:text-primary-950"
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
                  d="M9 6.75V15m6-6v8.25m.503-14.032a22.373 22.373 0 00-6.006 0C8.09 3.394 7 4.587 7 5.942v12.116c0 1.355 1.09 2.548 2.497 2.724a22.373 22.373 0 006.006 0C16.91 20.606 18 19.413 18 18.058V5.942c0-1.355-1.09-2.548-2.497-2.724z"
                />
              </svg>
              Carte
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-white text-primary-950 shadow-md"
                  : "text-gray-500 hover:text-primary-950"
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
                  d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              Liste
            </button>
          </div>
        </div>

        {/* Contenu : carte ou liste */}
        <div className="flex-1 overflow-hidden relative">
          {view === "map" ? (
            <MapView filters={filters} onPinClick={handlePinClick} />
          ) : (
            <div className="h-full overflow-y-auto p-4">
              <AnnonceList filters={filters} />
            </div>
          )}

          {/* Panneau latéral droit — détails annonce(s) */}
          <div
            style={{
              width: selectedListings.length > 0 ? 380 : 0,
              transition: "width 300ms ease-in-out",
              overflow: "hidden",
            }}
            className="absolute top-0 right-0 h-full bg-white shadow-2xl border-l border-gray-200 z-20"
          >
            <div
              style={{ width: 380, minWidth: 380 }}
              className="h-full flex flex-col"
            >
              {/* Header du panneau */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-base font-bold text-primary-950">
                  {selectedListings.length === 1
                    ? "Annonce"
                    : `${selectedListings.length} annonces`}
                </h3>
                <button
                  onClick={closePanel}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Liste des annonces */}
              <div className="flex-1 overflow-y-auto">
                {selectedListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/annonces/${listing.id}`}
                    className="block border-b border-gray-100 hover:bg-primary-50 transition-colors"
                  >
                    <div className="p-4">
                      {/* Badge type */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded text-white ${
                            listing.transactionType === "SALE"
                              ? "bg-accent-red"
                              : "bg-primary-950"
                          }`}
                        >
                          {listing.transactionType === "RENT"
                            ? "Location"
                            : "Vente"}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {propertyTypeLabels[listing.propertyType] ??
                            listing.propertyType}
                        </span>
                      </div>

                      {/* Titre */}
                      <h4 className="font-semibold text-gray-900 text-sm leading-snug mb-2">
                        {listing.title}
                      </h4>

                      {/* Prix */}
                      <p className="text-lg font-bold text-primary-950">
                        {listing.price.toLocaleString("fr-DZ")} DA
                        {listing.transactionType === "RENT" && (
                          <span className="text-xs font-normal text-gray-400">
                            {" "}
                            / mois
                          </span>
                        )}
                      </p>

                      {/* Lien */}
                      <span className="text-xs text-primary-950 font-semibold mt-2 inline-block">
                        Voir le detail →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
