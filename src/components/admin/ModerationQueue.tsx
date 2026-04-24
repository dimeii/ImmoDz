"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PendingListing = {
  id: string;
  title: string;
  description: string;
  price: number;
  transactionType: "RENT" | "SALE";
  propertyType: string;
  createdAt: string;
  wilaya: { name: string };
  commune: string | null;
  photos: { url: string }[];
  user: { id: string; name: string | null; email: string | null };
  agency: { id: string; slug: string | null; name: string } | null;
};

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

interface Props {
  initial: PendingListing[];
}

export default function ModerationQueue({ initial }: Props) {
  const router = useRouter();
  const [listings, setListings] = useState(initial);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const removeFromList = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const approve = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/listings/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      });
      if (!res.ok) {
        const e = await res.json();
        setError(e.error || "Erreur");
        return;
      }
      removeFromList(id);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  const reject = async () => {
    if (!rejectingId) return;
    if (reason.trim().length < 3) {
      setError("Motif trop court (3 chars min)");
      return;
    }
    setBusyId(rejectingId);
    setError(null);
    try {
      const res = await fetch("/api/admin/listings/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rejectingId,
          action: "reject",
          reason: reason.trim(),
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        setError(e.error || "Erreur");
        return;
      }
      removeFromList(rejectingId);
      setRejectingId(null);
      setReason("");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
        <p className="text-gray-500">Aucune annonce en attente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {listings.map((l) => (
        <article
          key={l.id}
          className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            <div className="md:w-64 md:flex-shrink-0 h-48 md:h-auto bg-gray-100 relative">
              {l.photos[0] ? (
                <Image
                  src={l.photos[0].url}
                  alt={l.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                  Pas de photo
                </div>
              )}
            </div>

            <div className="flex-1 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <Link
                    href={`/annonces/${l.id}`}
                    target="_blank"
                    className="font-headline font-bold text-gray-900 hover:underline underline-offset-2 text-lg"
                  >
                    {l.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {l.wilaya.name}
                    {l.commune && ` — ${l.commune}`} ·{" "}
                    {PROPERTY_LABELS[l.propertyType] ?? l.propertyType} ·{" "}
                    {l.transactionType === "RENT" ? "Location" : "Vente"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-950">
                    {l.price.toLocaleString("fr-DZ")} DA
                    {l.transactionType === "RENT" && (
                      <span className="text-xs text-gray-500 font-normal"> /mois</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(l.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-3 flex flex-wrap gap-x-3 gap-y-1">
                <span>
                  Agent:{" "}
                  <Link
                    href={`/agents/${l.user.id}`}
                    target="_blank"
                    className="text-primary-950 hover:underline"
                  >
                    {l.user.name ?? l.user.email ?? "—"}
                  </Link>
                </span>
                {l.agency && (
                  <span>
                    Agence:{" "}
                    {l.agency.slug ? (
                      <Link
                        href={`/agences/${l.agency.slug}`}
                        target="_blank"
                        className="text-primary-950 hover:underline"
                      >
                        {l.agency.name}
                      </Link>
                    ) : (
                      l.agency.name
                    )}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                {l.description}
              </p>

              {rejectingId === l.id ? (
                <div className="space-y-2">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Motif du rejet (visible par l'agent)"
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={reject}
                      disabled={busyId === l.id}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                      {busyId === l.id ? "..." : "Confirmer le rejet"}
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setReason("");
                        setError(null);
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => approve(l.id)}
                    disabled={busyId === l.id}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {busyId === l.id ? "..." : "Approuver"}
                  </button>
                  <button
                    onClick={() => setRejectingId(l.id)}
                    className="px-4 py-2 rounded-lg border border-red-300 text-red-700 text-sm font-semibold hover:bg-red-50"
                  >
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
