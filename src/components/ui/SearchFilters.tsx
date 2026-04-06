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

const ROOMS_OPTIONS = ["1", "2", "3", "4", "5"];

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
    <div className="space-y-8">
      {/* Transaction Type */}
      <div>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
          Type de Transaction
        </h2>
        <div className="flex p-1 bg-surface-container-low rounded-xl">
          <button
            onClick={() => setTransactionType("SALE")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              transactionType === "SALE"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Vente
          </button>
          <button
            onClick={() => setTransactionType("RENT")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              transactionType === "RENT"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Location
          </button>
        </div>
      </div>

      {/* Property Type */}
      <div>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
          Type de Bien
        </h2>
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="select-styled w-full bg-surface-container-low border-none rounded-xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20"
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
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
          Wilaya
        </h2>
        <select
          value={wilayaCode}
          onChange={(e) => setWilayaCode(e.target.value)}
          className="select-styled w-full bg-surface-container-low border-none rounded-xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Toutes les wilayas</option>
          {wilayas?.map((w) => (
            <option key={w.code} value={w.code}>
              {w.code} — {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Budget */}
      <div>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
          Budget (DA{transactionType === "RENT" ? "/mois" : ""})
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/40"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/40"
          />
        </div>
      </div>

      {/* Surface */}
      <div>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
          Surface (m²)
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            value={surfaceMin}
            onChange={(e) => setSurfaceMin(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/40"
          />
          <input
            type="number"
            placeholder="Max"
            value={surfaceMax}
            onChange={(e) => setSurfaceMax(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/40"
          />
        </div>
      </div>

      {/* Rooms */}
      <div>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
          Pièces
        </h2>
        <div className="flex gap-2">
          {ROOMS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRooms(rooms === r ? "" : r)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                rooms === r
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "bg-surface-container-low hover:bg-primary/5 border border-transparent"
              }`}
            >
              {r}+
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 pb-8 space-y-3">
        <button
          onClick={handleReset}
          className="w-full py-3 text-on-surface-variant text-xs font-bold tracking-widest uppercase hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">restart_alt</span>
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
