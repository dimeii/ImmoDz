"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GatePage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-primary-950 text-center mb-2">
          ImmoDz
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Entrez le mot de passe pour accéder au site
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="Mot de passe"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-950 focus:border-transparent"
          autoFocus
        />

        {error && (
          <p className="text-red-500 text-sm mt-2">Mot de passe incorrect</p>
        )}

        <button
          type="submit"
          className="w-full mt-4 bg-primary-950 text-white py-3 rounded-lg font-semibold hover:bg-primary-900 transition-colors"
        >
          Entrer
        </button>
      </form>
    </div>
  );
}
