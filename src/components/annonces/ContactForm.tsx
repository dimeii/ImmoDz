"use client";

import { useState } from "react";

interface ContactFormProps {
  listingId: string;
}

export default function ContactForm({ listingId }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, name, email, message, phone }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="contact">
      {sent && (
        <div className="bg-primary-fixed/30 text-primary rounded-lg p-3 text-sm font-medium text-center">
          Message envoyé avec succès !
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-on-surface-variant mb-2">
          Nom Complet
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Votre nom"
          className="w-full bg-surface-container-low border-none rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface-variant mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          className="w-full bg-surface-container-low border-none rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface-variant mb-2">
          Téléphone
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="05XX XX XX XX"
          className="w-full bg-surface-container-low border-none rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface-variant mb-2">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={3}
          placeholder="Bonjour, je suis intéressé par ce bien..."
          className="w-full bg-surface-container-low border-none rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40 resize-none"
        />
      </div>
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-lg hover:bg-primary-container transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? "Envoi..." : "Demander une visite"}
        </button>
      </div>
      <p className="text-[10px] text-center text-on-surface-variant leading-relaxed">
        En envoyant ce formulaire, vous acceptez nos conditions générales et
        notre politique de confidentialité.
      </p>
    </form>
  );
}
