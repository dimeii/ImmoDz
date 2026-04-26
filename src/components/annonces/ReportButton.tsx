"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { REPORT_REASON_LABELS, REPORT_REASONS } from "@/lib/validations/report";

export default function ReportButton({ listingId }: { listingId: string }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REPORT_REASONS)[number]>("FAKE");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/listings/${listingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, comment: comment || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'envoi");
        return;
      }
      setDone(true);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
        aria-label="Signaler cette annonce"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"
          />
        </svg>
        Signaler
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Signaler l'annonce</h2>
              <button
                onClick={() => !loading && setOpen(false)}
                aria-label="Fermer"
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {!session?.user ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Connectez-vous pour signaler une annonce.
                </p>
                <Link
                  href={`/login?callbackUrl=/annonces/${listingId}`}
                  className="block w-full text-center bg-primary-950 text-white font-semibold py-2 rounded-lg hover:bg-primary-900"
                >
                  Se connecter
                </Link>
              </div>
            ) : done ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                  Merci, votre signalement a été transmis aux modérateurs.
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    setDone(false);
                    setComment("");
                  }}
                  className="w-full text-sm text-gray-600 hover:text-gray-900"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Motif du signalement
                  </label>
                  <select
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value as (typeof REPORT_REASONS)[number])
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {REPORT_REASON_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Précisions (optionnel)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="Ajoutez des détails utiles à la modération…"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{comment.length}/2000</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? "Envoi…" : "Signaler"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
