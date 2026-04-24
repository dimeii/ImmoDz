"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface Props {
  filters: Record<string, string>;
}

const NUMBER_KEYS = new Set([
  "wilayaCode",
  "priceMin",
  "priceMax",
  "surfaceMin",
  "surfaceMax",
  "rooms",
  "bedrooms",
  "bathrooms",
]);

const ALLOWED_KEYS = new Set([
  "transactionType",
  "propertyType",
  "wilayaCode",
  "quartierId",
  "priceMin",
  "priceMax",
  "surfaceMin",
  "surfaceMax",
  "rooms",
  "bedrooms",
  "bathrooms",
]);

function normalizeFilters(raw: Record<string, string>) {
  const result: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!v || !ALLOWED_KEYS.has(k)) continue;
    if (NUMBER_KEYS.has(k)) {
      const n = Number(v);
      if (!Number.isNaN(n)) result[k] = n;
    } else {
      result[k] = v;
    }
  }
  return result;
}

export default function SaveSearchButton({ filters }: Props) {
  const { status } = useSession();
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  if (status !== "authenticated") return null;

  const handleSave = async () => {
    const name = window.prompt("Nom de cette alerte :");
    if (!name || !name.trim()) return;

    setState("saving");
    try {
      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          filters: normalizeFilters(filters),
        }),
      });
      if (res.ok) {
        setState("saved");
        setTimeout(() => setState("idle"), 3000);
      } else {
        setState("error");
        setTimeout(() => setState("idle"), 3000);
      }
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  const label =
    state === "saving"
      ? "Enregistrement..."
      : state === "saved"
        ? "✓ Alerte créée"
        : state === "error"
          ? "Erreur"
          : "🔔 Créer une alerte";

  return (
    <button
      onClick={handleSave}
      disabled={state === "saving"}
      className="inline-flex items-center gap-2 rounded-full bg-white border border-primary-950 text-primary-950 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary-950 hover:text-white transition-colors disabled:opacity-50"
    >
      {label}
    </button>
  );
}
