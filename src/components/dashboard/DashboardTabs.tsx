"use client";

import { useState } from "react";
import DashboardListings from "./DashboardListings";

/* ─── Types ─── */
interface Listing {
  id: string;
  title: string;
  price: number;
  transactionType: "RENT" | "SALE";
  propertyType: string;
  status: string;
  commune: string | null;
  wilaya: { name: string };
  photos: { url: string }[];
  createdAt: string;
}

interface Stats {
  active: number;
  rent: number;
  sale: number;
  archived: number;
  total: number;
}

interface UserInfo {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}

interface Props {
  user: UserInfo;
  stats: Stats;
  initialListings: Listing[];
  initialTotal: number;
  initialCursor: string | null;
}

/* ─── Onglets ─── */
const TABS = [
  { id: "listings", label: "Mes annonces", icon: "list_alt" },
  { id: "account", label: "Mon compte", icon: "manage_accounts" },
  { id: "stats", label: "Statistiques", icon: "bar_chart" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  AGENCY_DIRECTOR: "Directeur d'agence",
  AGENCY_EMPLOYEE: "Agent immobilier",
  USER: "Particulier",
};

/* ─── Stat card ─── */
function StatCard({
  label,
  value,
  sub,
  color = "primary",
}: {
  label: string;
  value: number;
  sub?: string;
  color?: "primary" | "green" | "red" | "gray";
}) {
  const colors = {
    primary: "bg-primary-50 text-primary-950 border-primary-100",
    green: "bg-green-50 text-green-800 border-green-100",
    red: "bg-red-50 text-red-800 border-red-100",
    gray: "bg-gray-50 text-gray-700 border-gray-100",
  };
  return (
    <div
      className={`rounded-2xl border p-6 flex flex-col gap-1 ${colors[color]}`}
    >
      <span className="text-xs font-semibold uppercase tracking-widest opacity-70">
        {label}
      </span>
      <span className="text-4xl font-black">{value}</span>
      {sub && <span className="text-xs opacity-60">{sub}</span>}
    </div>
  );
}

/* ─── Account tab ─── */
function AccountTab({ user }: { user: UserInfo }) {
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur lors de la sauvegarde");
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-950 focus:ring-1 focus:ring-primary-950 outline-none transition-colors bg-white";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-lg space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-950 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
          {name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="font-bold text-gray-900">{name || "—"}</p>
          <span className="inline-block mt-1 text-xs font-semibold bg-primary-100 text-primary-950 px-2 py-0.5 rounded-full">
            {ROLE_LABELS[user.role] ?? user.role}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-5">
        <div>
          <label className={labelCls}>Nom complet</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Adresse e-mail</label>
          <input
            type="email"
            value={user.email ?? ""}
            readOnly
            className={inputCls + " bg-gray-50 cursor-not-allowed text-gray-400"}
          />
          <p className="text-xs text-gray-400 mt-1">L'adresse e-mail ne peut pas être modifiée.</p>
        </div>

        <div>
          <label className={labelCls}>Téléphone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex : 0555 12 34 56"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Membre depuis</label>
          <p className="text-sm text-gray-600">
            {new Date(user.createdAt).toLocaleDateString("fr-DZ", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
          Profil mis à jour avec succès.
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !name.trim()}
        className="w-full rounded-xl bg-primary-950 text-white font-bold py-3 text-sm hover:bg-primary-900 disabled:opacity-50 transition-colors"
      >
        {saving ? "Enregistrement…" : "Enregistrer les modifications"}
      </button>
    </div>
  );
}

/* ─── Stats tab ─── */
function StatsTab({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Annonces actives" value={stats.active} color="green" />
        <StatCard label="En location" value={stats.rent} sub="annonces actives" color="primary" />
        <StatCard label="En vente" value={stats.sale} sub="annonces actives" color="red" />
        <StatCard label="Archivées" value={stats.archived} color="gray" />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h3 className="font-bold text-gray-900 mb-4">Récapitulatif</h3>
        <dl className="space-y-3">
          {[
            { label: "Total annonces publiées", value: stats.total },
            { label: "Annonces actives", value: stats.active },
            { label: "Locations actives", value: stats.rent },
            { label: "Ventes actives", value: stats.sale },
            { label: "Annonces archivées / supprimées", value: stats.archived },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <dt className="text-sm text-gray-500">{row.label}</dt>
              <dd className="text-sm font-bold text-gray-900">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export default function DashboardTabs({
  user,
  stats,
  initialListings,
  initialTotal,
  initialCursor,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("listings");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-2xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-primary-950 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "listings" && (
        <DashboardListings
          initialListings={initialListings}
          initialTotal={initialTotal}
          initialCursor={initialCursor}
        />
      )}
      {activeTab === "account" && <AccountTab user={user} />}
      {activeTab === "stats" && <StatsTab stats={stats} />}
    </div>
  );
}
