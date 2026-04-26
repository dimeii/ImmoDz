"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type PendingAgency = {
  id: string;
  slug: string | null;
  name: string;
  logo: string | null;
  kycDocumentUrl: string | null;
  kycSubmittedAt: string | null;
  wilaya: { name: string } | null;
  director: { name: string | null; email: string | null } | null;
};

interface Props {
  initial: PendingAgency[];
}

export default function KycQueue({ initial }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const remove = (id: string) =>
    setItems((prev) => prev.filter((a) => a.id !== id));

  const approve = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/agencies/kyc-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyId: id, action: "approve" }),
      });
      if (!res.ok) {
        const e = await res.json();
        setError(e.error || "Erreur");
        return;
      }
      remove(id);
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
      const res = await fetch("/api/admin/agencies/kyc-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId: rejectingId,
          action: "reject",
          reason: reason.trim(),
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        setError(e.error || "Erreur");
        return;
      }
      remove(rejectingId);
      setRejectingId(null);
      setReason("");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  const fmtDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("fr-DZ", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
        <p className="text-gray-500">Aucune agence en attente de vérification.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {items.map((a) => (
          <article
            key={a.id}
            className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              <button
                type="button"
                onClick={() => setPreviewUrl(a.kycDocumentUrl)}
                className="md:w-56 md:flex-shrink-0 h-48 md:h-auto bg-gray-100 relative hover:opacity-90 transition-opacity text-left"
              >
                {a.kycDocumentUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.kycDocumentUrl}
                    alt={`Registre ${a.name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Pas de document
                  </div>
                )}
                <span className="absolute bottom-2 left-2 text-xs bg-black/70 text-white px-2 py-0.5 rounded">
                  Cliquer pour agrandir
                </span>
              </button>

              <div className="flex-1 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {a.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.logo} alt={a.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-emerald-700 font-bold text-lg">
                        {a.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-headline font-bold text-gray-900 text-lg">
                      {a.slug ? (
                        <Link
                          href={`/agences/${a.slug}`}
                          target="_blank"
                          className="hover:underline"
                        >
                          {a.name}
                        </Link>
                      ) : (
                        a.name
                      )}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {a.wilaya?.name ?? "—"} · Soumis le {fmtDate(a.kycSubmittedAt)}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-semibold">Directeur : </span>
                  {a.director?.name ?? "—"}{" "}
                  {a.director?.email && (
                    <a
                      href={`mailto:${a.director.email}`}
                      className="text-primary-950 hover:underline ml-1"
                    >
                      ({a.director.email})
                    </a>
                  )}
                </div>

                {rejectingId === a.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Motif du rejet (visible par le directeur)"
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={reject}
                        disabled={busyId === a.id}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                      >
                        {busyId === a.id ? "..." : "Confirmer le rejet"}
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
                      onClick={() => approve(a.id)}
                      disabled={busyId === a.id}
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {busyId === a.id ? "..." : "Approuver"}
                    </button>
                    <button
                      onClick={() => setRejectingId(a.id)}
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

      {previewUrl && (
        <button
          type="button"
          onClick={() => setPreviewUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Document KYC"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="absolute top-4 right-4 text-white text-sm">
            Cliquer en dehors pour fermer
          </span>
        </button>
      )}
    </>
  );
}
