"use client";

import Link from "next/link";
import useSWR from "swr";
import { useState } from "react";
import AnnonceCard from "./AnnonceCard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface AnnonceListProps {
  filters: Record<string, string>;
}

export default function AnnonceList({ filters }: AnnonceListProps) {
  const [page, setPage] = useState(1);

  // Reset page when filters change
  const filtersKey = JSON.stringify(filters);

  const params = new URLSearchParams(filters);
  params.set("page", String(page));
  params.set("limit", "20");

  const { data, isLoading } = useSWR(
    `/api/annonces?${params.toString()}`,
    fetcher,
    { keepPreviousData: true }
  );

  // Reset page to 1 when filters change
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);
  if (filtersKey !== prevFiltersKey) {
    setPrevFiltersKey(filtersKey);
    setPage(1);
  }

  if (isLoading && !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-500">Chargement des annonces...</div>
      </div>
    );
  }

  if (!data?.annonces?.length) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-lg bg-gray-50">
        <p className="text-lg font-medium text-gray-600">Aucune annonce trouvée</p>
        <p className="mt-1 text-sm text-gray-400">
          Essayez de modifier vos filtres
        </p>
      </div>
    );
  }

  const { pagination } = data;

  return (
    <div className="flex h-full flex-col">
      {/* Header résultats */}
      <div className="mb-4 flex items-center justify-between px-1">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{pagination.total}</span>{" "}
          annonce{pagination.total > 1 ? "s" : ""} trouvée{pagination.total > 1 ? "s" : ""}
        </p>
        {isLoading && (
          <span className="text-xs text-gray-400">Mise à jour...</span>
        )}
      </div>

      {/* Grille */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.annonces.map(
            (annonce: {
              id: string;
              title: string;
              price: number;
              transactionType: "RENT" | "SALE";
              propertyType: string;
              surface?: number | null;
              rooms?: number | null;
              wilaya: { name: string };
              photos: { url: string }[];
            }) => (
              <Link key={annonce.id} href={`/annonces/${annonce.id}`} target="_blank">
                <AnnonceCard
                  id={annonce.id}
                  title={annonce.title}
                  price={annonce.price}
                  transactionType={annonce.transactionType}
                  propertyType={annonce.propertyType}
                  surface={annonce.surface}
                  rooms={annonce.rooms}
                  wilaya={annonce.wilaya.name}
                  thumbnail={annonce.photos[0]?.url}
                />
              </Link>
            )
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 border-t pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          >
            Précédent
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 ||
                p === pagination.totalPages ||
                Math.abs(p - page) <= 2
            )
            .reduce<number[]>((acc, p) => {
              if (acc.length > 0 && p - acc[acc.length - 1] > 1) {
                acc.push(-1); // gap marker
              }
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === -1 ? (
                <span key={`gap-${i}`} className="px-1 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-md px-3 py-1 text-sm ${
                    p === page
                      ? "bg-primary-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
