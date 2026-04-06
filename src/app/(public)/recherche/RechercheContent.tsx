"use client";

import { useState, useCallback, useEffect } from "react";
import MapView, { PinProperties } from "@/components/map/MapView";
import AnnonceList from "@/components/annonces/AnnonceList";
import SearchFilters from "@/components/ui/SearchFilters";
import PhotoCarousel from "@/components/annonces/PhotoCarousel";
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

export default function RechercheContent() {
  const [filters, setFilters] = useState<Record<string, string>>({
    transactionType: "RENT",
  });
  const [view, setView] = useState<ViewMode>("map");
  const [selectedListings, setSelectedListings] = useState<PinProperties[]>([]);

  interface ListingDetail {
    id: string;
    title: string;
    price: number;
    transactionType: string;
    propertyType: string;
    surface?: number | null;
    rooms?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    commune?: string | null;
    description?: string | null;
    wilaya: { name: string };
    photos: { url: string }[];
  }
  const [listingDetails, setListingDetails] = useState<
    Record<string, ListingDetail>
  >({});

  useEffect(() => {
    if (selectedListings.length === 0) return;
    const idsToFetch = selectedListings
      .map((l) => l.id)
      .filter((id) => !listingDetails[id]);
    if (idsToFetch.length === 0) return;

    idsToFetch.forEach((id) => {
      fetch(`/api/annonces/${id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && !data.error) {
            setListingDetails((prev) => ({ ...prev, [id]: data }));
          }
        });
    });
  }, [selectedListings]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <main className="-mt-20 pt-20 flex h-screen overflow-hidden bg-background">
      {/* ============ SIDEBAR FILTERS ============ */}
      <aside className="w-[340px] bg-surface-container-lowest flex-shrink-0 flex flex-col z-40 border-r border-outline-variant/10">
        <div className="p-6 overflow-y-auto scrollbar-hide flex-1">
          <SearchFilters onFiltersChange={handleFiltersChange} />
        </div>
      </aside>

      {/* ============ MAIN CONTENT AREA ============ */}
      <section className="flex-1 relative overflow-hidden">
        {/* Map or List */}
        {view === "map" ? (
          <MapView filters={filters} onPinClick={handlePinClick} />
        ) : (
          <div className="h-full overflow-y-auto p-6 bg-surface-container-low">
            <AnnonceList filters={filters} />
          </div>
        )}

        {/* Floating View Toggle */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-surface-container-lowest/80 backdrop-blur-md rounded-full p-1 shadow-2xl flex items-center gap-1">
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all ${
              view === "map"
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-sm">map</span>
            Carte
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all ${
              view === "list"
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              format_list_bulleted
            </span>
            Liste
          </button>
        </div>

        {/* ============ PROPERTY DETAIL PANEL ============ */}
        {selectedListings.length > 0 && (
          <div className="absolute right-6 top-6 bottom-6 w-[380px] bg-surface-container-lowest rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden border border-outline-variant/10 animate-[fadeIn_0.2s_ease-out]">
            {/* Panel header with close */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container flex-shrink-0">
              <h3 className="text-sm font-bold font-headline text-on-surface">
                {selectedListings.length === 1
                  ? "Annonce"
                  : `${selectedListings.length} annonces`}
              </h3>
              <button
                onClick={closePanel}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-all text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {selectedListings.map((listing) => {
                const detail = listingDetails[listing.id];
                const photos =
                  detail?.photos ??
                  (listing.thumbnail ? [{ url: listing.thumbnail }] : []);

                return (
                  <div
                    key={listing.id}
                    className="border-b border-surface-container last:border-b-0"
                  >
                    {/* Photo */}
                    <div className="relative h-64 overflow-hidden">
                      {photos.length > 0 ? (
                        <PhotoCarousel photos={photos} alt={listing.title} />
                      ) : (
                        <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-outline-variant">
                            image
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block ${
                              listing.transactionType === "SALE"
                                ? "bg-accent-red/10 text-accent-red"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {listing.transactionType === "RENT"
                              ? "Location"
                              : "Vente"}
                          </div>
                          <h3 className="text-xl font-bold font-headline text-on-surface tracking-tight leading-tight">
                            {listing.title}
                          </h3>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-2xl font-bold text-primary font-headline">
                            {listing.price >= 1_000_000
                              ? `${(listing.price / 1_000_000).toFixed(1)}M`
                              : listing.price.toLocaleString("fr-DZ")}
                          </p>
                          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                            DA
                            {listing.transactionType === "RENT" ? " / mois" : ""}
                          </p>
                        </div>
                      </div>

                      {/* Stats row */}
                      {detail && (
                        <div className="flex items-center gap-4 text-on-surface-variant text-sm py-4 border-y border-surface-container">
                          {detail.bedrooms != null && (
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-primary text-lg">
                                bed
                              </span>
                              <span className="font-bold">
                                {detail.bedrooms}
                              </span>
                            </div>
                          )}
                          {detail.bathrooms != null && (
                            <div className="flex items-center gap-1.5 border-l border-surface-container pl-4">
                              <span className="material-symbols-outlined text-primary text-lg">
                                bathtub
                              </span>
                              <span className="font-bold">
                                {detail.bathrooms}
                              </span>
                            </div>
                          )}
                          {detail.surface != null && (
                            <div className="flex items-center gap-1.5 border-l border-surface-container pl-4">
                              <span className="material-symbols-outlined text-primary text-lg">
                                square_foot
                              </span>
                              <span className="font-bold">
                                {detail.surface}m²
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Location */}
                      {detail && (
                        <p className="text-sm text-on-surface-variant">
                          {detail.wilaya.name}
                          {detail.commune && ` — ${detail.commune}`}
                        </p>
                      )}

                      {/* Description */}
                      {detail?.description && (
                        <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                          {detail.description}
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <Link
                          href={`/annonces/${listing.id}`}
                          className="py-3 px-4 border border-outline text-primary font-bold rounded-xl text-xs hover:bg-surface-container-low transition-all text-center"
                        >
                          Voir le détail
                        </Link>
                        <Link
                          href={`/annonces/${listing.id}#contact`}
                          className="py-3 px-4 bg-primary text-on-primary font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                          <span className="material-symbols-outlined text-sm">
                            mail
                          </span>
                          Contacter
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
