"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  price: number;
  transactionType: "RENT" | "SALE";
  propertyType: string;
  status: string;
  commune: string | null;
  wilaya: { name: string };
  photos: { url: string }[];
  createdAt: string;
}

const PROPERTY_LABELS: Record<string, string> = {
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

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "Active", cls: "bg-green-100 text-green-800" },
  DRAFT: { label: "Brouillon", cls: "bg-gray-100 text-gray-800" },
  PENDING: { label: "En attente", cls: "bg-yellow-100 text-yellow-800" },
  REJECTED: { label: "Rejetée", cls: "bg-red-100 text-red-800" },
  ARCHIVED: { label: "Archivée", cls: "bg-gray-100 text-gray-600" },
};

const SORT_OPTIONS = [
  { value: "recent", label: "Plus récentes" },
  { value: "oldest", label: "Plus anciennes" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
];

interface Props {
  initialListings: Listing[];
  initialTotal: number;
  initialCursor: string | null;
}

export default function DashboardListings({
  initialListings,
  initialTotal,
  initialCursor,
}: Props) {
  const [listings, setListings] = useState(initialListings);
  const [total, setTotal] = useState(initialTotal);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  // Filters
  const [status, setStatus] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [sort, setSort] = useState("recent");
  const [search, setSearch] = useState("");

  const buildUrl = useCallback(
    (cursorVal?: string) => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (propertyType) params.set("propertyType", propertyType);
      if (transactionType) params.set("transactionType", transactionType);
      if (sort) params.set("sort", sort);
      if (search.trim()) params.set("q", search.trim());
      if (cursorVal) params.set("cursor", cursorVal);
      return `/api/annonces/mes-annonces?${params}`;
    },
    [status, propertyType, transactionType, sort, search]
  );

  const fetchListings = useCallback(
    async (append = false, cursorVal?: string) => {
      setLoading(true);
      try {
        const res = await fetch(buildUrl(cursorVal));
        const data = await res.json();
        if (append) {
          setListings((prev) => [...prev, ...data.annonces]);
        } else {
          setListings(data.annonces);
        }
        setTotal(data.total);
        setCursor(data.nextCursor);
      } finally {
        setLoading(false);
      }
    },
    [buildUrl]
  );

  const applyFilters = () => {
    fetchListings(false);
  };

  const loadMore = () => {
    if (cursor) fetchListings(true, cursor);
  };

  return (
    <div>
      {/* Filters bar */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Recherche
            </label>
            <input
              type="text"
              placeholder="Titre, commune..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-950 focus:outline-none focus:ring-1 focus:ring-primary-950"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Statut
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-950 focus:outline-none"
            >
              <option value="">Tous</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Brouillon</option>
              <option value="PENDING">En attente</option>
              <option value="ARCHIVED">Archivée</option>
            </select>
          </div>

          {/* Transaction type */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Type
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-950 focus:outline-none"
            >
              <option value="">Tous</option>
              <option value="RENT">Location</option>
              <option value="SALE">Vente</option>
            </select>
          </div>

          {/* Property type */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Bien
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-950 focus:outline-none"
            >
              <option value="">Tous</option>
              {Object.entries(PROPERTY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Tri
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-950 focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Apply button */}
          <button
            onClick={applyFilters}
            disabled={loading}
            className="rounded-lg bg-primary-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-900 disabled:opacity-50"
          >
            Filtrer
          </button>
        </div>
      </div>

      {/* Count */}
      <p className="mb-4 text-sm text-gray-500">
        {total} annonce{total !== 1 ? "s" : ""} trouvée{total !== 1 ? "s" : ""}
      </p>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
          <p className="text-gray-500">Aucune annonce trouvée</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/annonces/${listing.id}`}
              className="block rounded-2xl border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {listing.photos.length > 0 ? (
                    <img
                      src={listing.photos[0].url}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <svg
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {listing.wilaya.name}
                    {listing.commune && ` — ${listing.commune}`}
                    {" · "}
                    {PROPERTY_LABELS[listing.propertyType] ?? listing.propertyType}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        listing.transactionType === "RENT"
                          ? "text-primary-950"
                          : "text-accent-red"
                      }`}
                    >
                      {listing.price.toLocaleString("fr-DZ")} DA
                      {listing.transactionType === "RENT" && "/mois"}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        STATUS_LABELS[listing.status]?.cls ?? "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {STATUS_LABELS[listing.status]?.label ?? listing.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {listing.transactionType === "RENT" ? "Location" : "Vente"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load more */}
      {cursor && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-primary-950 hover:text-primary-950 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Chargement...
              </>
            ) : (
              <>
                Voir plus d'annonces
                <span className="text-xs text-gray-400">
                  ({listings.length} / {total})
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
