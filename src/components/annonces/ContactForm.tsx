"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";

interface ContactFormProps {
  listingId: string;
}

export default function ContactForm({ listingId }: ContactFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") {
    return <div className="text-sm text-on-surface-variant">Chargement…</div>;
  }

  if (!session?.user) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-on-surface-variant">
          Connectez-vous pour contacter l'annonceur et garder une trace de la conversation.
        </p>
        <Link
          href={`/login?callbackUrl=/annonces/${listingId}#contact`}
          className="inline-block w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-lg hover:bg-primary-container transition-all shadow-lg shadow-emerald-900/20"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, body: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");

      router.push("/dashboard/messages");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="contact">
      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm font-medium text-center">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-on-surface-variant mb-2">
          Votre message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          maxLength={5000}
          minLength={10}
          placeholder="Bonjour, je suis intéressé par ce bien. Pourrions-nous convenir d'une visite ?"
          className="w-full bg-surface-container-low border-none rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40 resize-none"
        />
        <p className="text-xs text-on-surface-variant/70 mt-1.5">
          {message.trim().length < 10
            ? `Encore ${10 - message.trim().length} caractère${10 - message.trim().length > 1 ? "s" : ""} minimum`
            : `${message.trim().length} / 5000 caractères`}
        </p>
      </div>
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || message.trim().length < 10}
          className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-lg hover:bg-primary-container transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? "Envoi…" : "Envoyer le message"}
        </button>
      </div>
      <p className="text-[10px] text-center text-on-surface-variant leading-relaxed">
        En envoyant ce formulaire, vous acceptez nos conditions générales et notre politique de confidentialité.
      </p>
    </form>
  );
}
