"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";

interface Membre {
  id: string;
  userId: string;
  role: "AGENCY_DIRECTOR" | "AGENCY_EMPLOYEE";
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    image: string | null;
  };
}

interface MembreListProps {
  isDirector: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MembreList({ isDirector }: MembreListProps) {
  const { data: membres, isLoading, error } = useSWR<Membre[]>(
    "/api/agence/membres",
    fetcher
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleRemove = async (membreId: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir retirer ${name} de l'agence ?`)) {
      return;
    }

    setActionLoading(membreId);
    try {
      const res = await fetch(`/api/agence/membres/${membreId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Erreur lors du retrait");
        return;
      }

      mutate("/api/agence/membres");
    } catch (err) {
      alert("Erreur réseau");
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async (membreId: string, newRole: string) => {
    setActionLoading(membreId);
    try {
      const res = await fetch(`/api/agence/membres/${membreId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Erreur lors de la modification");
        return;
      }

      mutate("/api/agence/membres");
      alert("Rôle modifié. L'agent doit se reconnecter pour que les modifications prennent effet.");
    } catch (err) {
      alert("Erreur réseau");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
        <p className="text-gray-500 text-center py-8">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
        <p className="text-red-500 text-center py-8">Erreur de chargement</p>
      </div>
    );
  }

  if (!membres || membres.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
        <p className="text-gray-500 text-center py-8">Aucun membre dans l&apos;agence</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Depuis
              </th>
              {isDirector && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {membres.map((membre) => (
              <tr
                key={membre.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {membre.user.name || "Sans nom"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {membre.user.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {membre.user.phone || "—"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      membre.role === "AGENCY_DIRECTOR"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {membre.role === "AGENCY_DIRECTOR" ? "Directeur" : "Agent"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(membre.joinedAt).toLocaleDateString("fr-FR")}
                </td>
                {isDirector && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleChangeRole(
                            membre.id,
                            membre.role === "AGENCY_DIRECTOR"
                              ? "AGENCY_EMPLOYEE"
                              : "AGENCY_DIRECTOR"
                          )
                        }
                        disabled={actionLoading === membre.id}
                        className="px-3 py-1 rounded bg-primary-100 text-primary-950 hover:bg-primary-200 font-semibold text-xs disabled:opacity-50 transition-colors"
                      >
                        {membre.role === "AGENCY_DIRECTOR"
                          ? "Rétrograder"
                          : "Promouvoir"}
                      </button>
                      <button
                        onClick={() =>
                          handleRemove(
                            membre.id,
                            membre.user.name || membre.user.email || "cet agent"
                          )
                        }
                        disabled={actionLoading === membre.id}
                        className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-semibold text-xs disabled:opacity-50 transition-colors"
                      >
                        Retirer
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
