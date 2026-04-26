"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REPORT_REASON_LABELS } from "@/lib/validations/report";

type Reason = keyof typeof REPORT_REASON_LABELS;

type Reporter = { id: string; name: string | null; email: string | null } | null;

type ReportItem = {
  id: string;
  reason: Reason;
  comment: string | null;
  createdAt: string;
  reporter: Reporter;
};

type Group = {
  listingId: string;
  listing: {
    id: string;
    title: string;
    status: string;
    photos: { url: string }[];
    user: { id: string; name: string | null; email: string | null };
  };
  reports: ReportItem[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-DZ", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReportsQueue({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function reviewReport(
    reportId: string,
    action: "REVIEWED" | "DISMISSED",
    rejectListing = false
  ) {
    setBusy(reportId);
    setError(null);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          action,
          rejectListing,
          rejectionReason: rejectListing ? rejectionReason : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur");
        return;
      }
      setRejecting(null);
      setRejectionReason("");
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {groups.map((g) => (
        <div
          key={g.listingId}
          className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
        >
          {/* Header annonce */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-4">
            {g.listing.photos[0]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={g.listing.photos[0].url}
                alt=""
                className="h-16 w-24 object-cover rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="h-16 w-24 bg-gray-100 rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <Link
                href={`/annonces/${g.listing.id}`}
                target="_blank"
                className="font-bold text-gray-900 hover:text-primary-950 truncate block"
              >
                {g.listing.title}
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">
                Auteur : {g.listing.user.name ?? "—"} ({g.listing.user.email ?? "—"})
              </p>
              <p className="text-xs text-gray-500">
                Statut : <span className="font-medium">{g.listing.status}</span> ·{" "}
                <span className="font-medium text-red-700">
                  {g.reports.length} signalement{g.reports.length > 1 ? "s" : ""}
                </span>
              </p>
            </div>
          </div>

          {/* Liste des signalements */}
          <ul className="divide-y divide-gray-100">
            {g.reports.map((r) => (
              <li key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {REPORT_REASON_LABELS[r.reason]}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {r.reporter?.name ?? "Anonyme"}
                      {r.reporter?.email && ` · ${r.reporter.email}`} · {formatDate(r.createdAt)}
                    </p>
                    {r.comment && (
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                        {r.comment}
                      </p>
                    )}
                  </div>

                  {rejecting === r.id ? (
                    <div className="flex flex-col gap-2 w-72">
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Motif communiqué à l'agent (min 3 chars)…"
                        rows={2}
                        className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setRejecting(null);
                            setRejectionReason("");
                          }}
                          disabled={busy === r.id}
                          className="flex-1 text-xs font-medium px-2 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => reviewReport(r.id, "REVIEWED", true)}
                          disabled={busy === r.id || rejectionReason.trim().length < 3}
                          className="flex-1 text-xs font-semibold px-2 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {busy === r.id ? "…" : "Confirmer"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => reviewReport(r.id, "DISMISSED")}
                        disabled={busy === r.id}
                        className="text-xs font-medium px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Rejeter
                      </button>
                      <button
                        onClick={() => reviewReport(r.id, "REVIEWED")}
                        disabled={busy === r.id}
                        className="text-xs font-medium px-3 py-1.5 rounded border border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                      >
                        Marquer traité
                      </button>
                      <button
                        onClick={() => setRejecting(r.id)}
                        disabled={busy === r.id}
                        className="text-xs font-semibold px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Rejeter l'annonce
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
