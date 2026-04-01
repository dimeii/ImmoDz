"use client";

import { useState } from "react";
import { mutate } from "swr";

interface InviterMembreFormProps {
  onSuccess?: () => void;
}

export default function InviterMembreForm({
  onSuccess,
}: InviterMembreFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/agence/membres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de l'invitation",
        });
        return;
      }

      setMessage({
        type: "success",
        text: `${data.user.name || email} a été ajouté à l'agence.`,
      });
      setEmail("");
      mutate("/api/agence/membres");
      onSuccess?.();
    } catch {
      setMessage({
        type: "error",
        text: "Erreur réseau",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Inviter un agent
      </h3>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          placeholder="Email de l'agent"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={isLoading || !email}
          className="px-6 py-2 bg-primary-950 text-white font-semibold rounded-lg hover:bg-primary-900 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Invitation..." : "Inviter"}
        </button>
      </div>

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <p className="text-sm text-gray-500 mt-4">
        L&apos;agent doit déjà avoir un compte. Après invitation, il devra se
        reconnecter pour que son nouveau rôle soit activé.
      </p>
    </form>
  );
}
