"use client";

import { useState } from "react";
import SingleImageUpload from "@/components/ui/SingleImageUpload";

type PropertyType =
  | "APARTMENT"
  | "HOUSE"
  | "VILLA"
  | "STUDIO"
  | "LAND"
  | "COMMERCIAL"
  | "OFFICE"
  | "GARAGE"
  | "OTHER";

const PROPERTY_LABELS: Record<PropertyType, string> = {
  APARTMENT: "Appartement",
  HOUSE: "Maison",
  VILLA: "Villa",
  STUDIO: "Studio",
  LAND: "Terrain",
  COMMERCIAL: "Commercial",
  OFFICE: "Bureau",
  GARAGE: "Garage",
  OTHER: "Autre",
};

interface Props {
  initial: {
    userId: string;
    name: string | null;
    phone: string | null;
    image: string | null;
    bio: string | null;
    specialtyTypes: PropertyType[];
    specialtyWilayas: number[];
  };
  wilayas: { code: number; name: string }[];
}

export default function ProfilForm({ initial, wilayas }: Props) {
  const [name, setName] = useState(initial.name ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [image, setImage] = useState<string | null>(initial.image);
  const [specialtyTypes, setSpecialtyTypes] = useState<PropertyType[]>(
    initial.specialtyTypes
  );
  const [specialtyWilayas, setSpecialtyWilayas] = useState<number[]>(
    initial.specialtyWilayas
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleType = (t: PropertyType) => {
    setSpecialtyTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const toggleWilaya = (code: number) => {
    setSpecialtyWilayas((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || null,
          bio: bio || null,
          image: image ?? "",
          specialtyTypes,
          specialtyWilayas,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Erreur");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500";

  const types: PropertyType[] = [
    "APARTMENT",
    "HOUSE",
    "VILLA",
    "STUDIO",
    "LAND",
    "COMMERCIAL",
    "OFFICE",
    "GARAGE",
    "OTHER",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
          Profil enregistré.
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Identité</h2>
        <div className="space-y-5">
          <SingleImageUpload
            value={image}
            onChange={setImage}
            label="Photo de profil"
            aspect="square"
            size="md"
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              maxLength={2000}
              className={inputClass}
              placeholder="Parcours, expertise, ce qui vous distingue…"
            />
            <p className="text-xs text-gray-500 mt-1">{bio.length}/2000</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Spécialités</h2>

        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Types de biens</p>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  specialtyTypes.includes(t)
                    ? "bg-primary-950 text-white border-primary-950"
                    : "bg-white text-gray-700 border-gray-300 hover:border-primary-500"
                }`}
              >
                {PROPERTY_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Wilayas couvertes
          </p>
          <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {wilayas.map((w) => (
              <label
                key={w.code}
                className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
              >
                <input
                  type="checkbox"
                  checked={specialtyWilayas.includes(w.code)}
                  onChange={() => toggleWilaya(w.code)}
                  className="accent-primary-950"
                />
                <span>
                  {String(w.code).padStart(2, "0")} {w.name}
                </span>
              </label>
            ))}
          </div>
          {specialtyWilayas.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {specialtyWilayas.length} wilaya(s) sélectionnée(s)
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-primary-950 text-white font-semibold hover:bg-primary-900 disabled:opacity-50 transition-colors"
        >
          {saving ? "Enregistrement..." : "Enregistrer le profil"}
        </button>
      </div>
    </form>
  );
}
