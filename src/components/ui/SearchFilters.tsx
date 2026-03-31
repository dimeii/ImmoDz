"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";

interface Wilaya {
  code: number;
  name: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PROPERTY_TYPES = [
  { value: "", label: "Tous les types" },
  { value: "APARTMENT", label: "Appartement" },
  { value: "HOUSE", label: "Maison" },
  { value: "VILLA", label: "Villa" },
  { value: "STUDIO", label: "Studio" },
  { value: "LAND", label: "Terrain" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "OFFICE", label: "Bureau" },
  { value: "GARAGE", label: "Garage" },
];

const ROOMS_OPTIONS = [
  { value: "", label: "Pièces" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
];

export interface SearchFiltersValues {
  transactionType: string;
  propertyType: string;
  wilayaCode: string;
  priceMin: string;
  priceMax: string;
  surfaceMin: string;
  surfaceMax: string;
  rooms: string;
}

interface SearchFiltersProps {
  onFiltersChange: (filters: Record<string, string>) => void;
}

export default function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const searchParams = useSearchParams();

  const [transactionType, setTransactionType] = useState(
    searchParams.get("transactionType") ?? "RENT"
  );
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") ?? ""
  );
  const [wilayaCode, setWilayaCode] = useState(
    searchParams.get("wilayaCode") ?? ""
  );
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") ?? "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") ?? "");
  const [surfaceMin, setSurfaceMin] = useState(
    searchParams.get("surfaceMin") ?? ""
  );
  const [surfaceMax, setSurfaceMax] = useState(
    searchParams.get("surfaceMax") ?? ""
  );
  const [rooms, setRooms] = useState(searchParams.get("rooms") ?? "");

  const { data: wilayas } = useSWR<Wilaya[]>("/api/wilayas", fetcher);

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (transactionType) filters.transactionType = transactionType;
    if (propertyType) filters.propertyType = propertyType;
    if (wilayaCode) filters.wilayaCode = wilayaCode;
    if (priceMin) filters.priceMin = priceMin;
    if (priceMax) filters.priceMax = priceMax;
    if (surfaceMin) filters.surfaceMin = surfaceMin;
    if (surfaceMax) filters.surfaceMax = surfaceMax;
    if (rooms) filters.rooms = rooms;
    onFiltersChange(filters);
  }, [transactionType, propertyType, wilayaCode, priceMin, priceMax, surfaceMin, surfaceMax, rooms, onFiltersChange]);

  function handleReset() {
    setTransactionType("RENT");
    setPropertyType("");
    setWilayaCode("");
    setPriceMin("");
    setPriceMax("");
    setSurfaceMin("");
    setSurfaceMax("");
    setRooms("");
  }

  return (
    <div className="space-y-4">
      {/* Type de transaction */}
      <div className="flex gap-2">
        <button
          onClick={() => setTransactionType("RENT")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            transactionType === "RENT"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Location
        </button>
        <button
          onClick={() => setTransactionType("SALE")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            transactionType === "SALE"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Vente
        </button>
      </div>

      {/* Type de bien */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Type de bien
        </label>
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Wilaya */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Wilaya
        </label>
        <select
          value={wilayaCode}
          onChange={(e) => setWilayaCode(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Toutes les wilayas</option>
          {wilayas?.map((w) => (
            <option key={w.code} value={w.code}>
              {w.code} — {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Prix */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Budget (DA{transactionType === "RENT" ? "/mois" : ""})
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Surface */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Surface (m²)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={surfaceMin}
            onChange={(e) => setSurfaceMin(e.target.value)}
            className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={surfaceMax}
            onChange={(e) => setSurfaceMax(e.target.value)}
            className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Pièces */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Nombre de pièces
        </label>
        <select
          value={rooms}
          onChange={(e) => setRooms(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {ROOMS_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Réinitialiser */}
      <button
        onClick={handleReset}
        className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
}
