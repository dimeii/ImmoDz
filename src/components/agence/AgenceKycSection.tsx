"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type KycStatus = "NONE" | "PENDING" | "VERIFIED" | "REJECTED";

interface Props {
  status: KycStatus;
  documentUrl: string | null;
  submittedAt: Date | string | null;
  reviewedAt: Date | string | null;
  rejectionReason: string | null;
  isDirector: boolean;
}

export default function AgenceKycSection({
  status,
  documentUrl,
  submittedAt,
  reviewedAt,
  rejectionReason,
  isDirector,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Merci d'uploader une image (JPG/PNG) du registre du commerce");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Fichier trop volumineux (max 10 Mo)");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const sigRes = await fetch("/api/upload/signature", { method: "POST" });
      if (!sigRes.ok) throw new Error("signature");
      const sig = await sigRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.api_key);
      formData.append("timestamp", sig.timestamp);
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
        { method: "POST", body: formData }
      );
      const cloudData = await cloudRes.json();
      if (!cloudData.secure_url || !cloudData.public_id) {
        throw new Error("cloudinary");
      }

      const submitRes = await fetch("/api/agence/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentUrl: cloudData.secure_url,
          documentPublicId: cloudData.public_id,
        }),
      });

      if (!submitRes.ok) {
        const err = await submitRes.json();
        setError(err.error || "Erreur lors de la soumission");
        return;
      }

      router.refresh();
    } catch {
      setError("Erreur réseau lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const fmtDate = (d: Date | string | null) =>
    d ? new Date(d).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" }) : null;

  const triggerUpload = () => inputRef.current?.click();

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Vérification (KYC)</h2>
        <StatusBadge status={status} />
      </div>

      {status === "NONE" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Faites vérifier votre agence pour obtenir le badge <strong>"Vérifié"</strong>{" "}
            visible sur votre fiche publique et sur toutes vos annonces. Cela rassure
            les clients et améliore votre taux de conversion.
          </p>
          <p className="text-sm text-gray-700">
            <strong>Document demandé :</strong> photo ou scan de votre registre du
            commerce (lisible, format JPG ou PNG, 10 Mo max).
          </p>
          {isDirector ? (
            <div>
              {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
              <button
                type="button"
                onClick={triggerUpload}
                disabled={uploading}
                className="px-5 py-2.5 rounded-lg bg-primary-950 text-white font-semibold text-sm hover:bg-primary-900 disabled:opacity-50 transition-colors"
              >
                {uploading ? "Upload en cours..." : "Uploader le registre du commerce"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Seul le directeur de l'agence peut soumettre le KYC.
            </p>
          )}
        </div>
      )}

      {status === "PENDING" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Votre document est en cours de vérification par notre équipe. Vous
            serez notifié par email dès la décision (approbation ou rejet avec motif).
          </p>
          {submittedAt && (
            <p className="text-xs text-gray-500">
              Soumis le {fmtDate(submittedAt)}
            </p>
          )}
          {documentUrl && (
            <a
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-primary-950 hover:underline"
            >
              Voir le document envoyé →
            </a>
          )}
        </div>
      )}

      {status === "VERIFIED" && (
        <div className="space-y-3">
          <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
            <strong>Agence vérifiée.</strong> Le badge "Vérifié" est affiché sur
            votre fiche publique et vos annonces.
          </p>
          {reviewedAt && (
            <p className="text-xs text-gray-500">
              Vérifiée le {fmtDate(reviewedAt)}
            </p>
          )}
        </div>
      )}

      {status === "REJECTED" && (
        <div className="space-y-4">
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm font-semibold text-red-800 mb-1">
              Document refusé
            </p>
            {rejectionReason && (
              <p className="text-sm text-red-700">{rejectionReason}</p>
            )}
            {reviewedAt && (
              <p className="text-xs text-red-600/70 mt-1">
                Décision du {fmtDate(reviewedAt)}
              </p>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Corrigez le problème indiqué et soumettez un nouveau document.
          </p>
          {isDirector ? (
            <div>
              {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
              <button
                type="button"
                onClick={triggerUpload}
                disabled={uploading}
                className="px-5 py-2.5 rounded-lg bg-primary-950 text-white font-semibold text-sm hover:bg-primary-900 disabled:opacity-50 transition-colors"
              >
                {uploading ? "Upload en cours..." : "Soumettre un nouveau document"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Seul le directeur de l'agence peut re-soumettre le KYC.
            </p>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: KycStatus }) {
  const config = {
    NONE: { label: "Non soumis", cls: "bg-gray-100 text-gray-700" },
    PENDING: { label: "En attente", cls: "bg-yellow-100 text-yellow-800" },
    VERIFIED: { label: "✓ Vérifiée", cls: "bg-emerald-100 text-emerald-800" },
    REJECTED: { label: "Refusé", cls: "bg-red-100 text-red-800" },
  }[status];
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.cls}`}>
      {config.label}
    </span>
  );
}
