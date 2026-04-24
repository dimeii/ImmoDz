"use client";

import { useState } from "react";
import { Agency } from "@prisma/client";
import SingleImageUpload from "@/components/ui/SingleImageUpload";

interface AgenceInfoFormProps {
  agency: Agency;
  memberRole: "AGENCY_DIRECTOR" | "AGENCY_EMPLOYEE";
  onSuccess?: () => void;
}

export default function AgenceInfoForm({
  agency,
  memberRole,
  onSuccess,
}: AgenceInfoFormProps) {
  const isDirector = memberRole === "AGENCY_DIRECTOR";
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: agency.name || "",
    email: agency.email || "",
    phone: agency.phone || "",
    address: agency.address || "",
    description: agency.description || "",
    website: agency.website || "",
    foundedYear: agency.foundedYear?.toString() || "",
  });
  const [logo, setLogo] = useState<string | null>(agency.logo);
  const [coverImage, setCoverImage] = useState<string | null>(agency.coverImage);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        ...formData,
        logo: logo ?? "",
        coverImage: coverImage ?? "",
      };
      if (formData.foundedYear === "") {
        payload.foundedYear = null;
      } else {
        payload.foundedYear = parseInt(formData.foundedYear, 10);
      }

      const res = await fetch("/api/agence", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Erreur lors de la sauvegarde");
        return;
      }

      setIsEditing(false);
      onSuccess?.();
    } catch {
      setError("Erreur réseau");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Informations agence</h2>
        {isDirector && (
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              isEditing
                ? "bg-primary-950 text-white hover:bg-primary-900 disabled:opacity-50"
                : "bg-primary-100 text-primary-950 hover:bg-primary-200"
            }`}
          >
            {isEditing ? (isSaving ? "Enregistrement..." : "Enregistrer") : "Modifier"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Logo + cover upload en édition uniquement */}
        {isEditing && isDirector && (
          <div className="grid sm:grid-cols-2 gap-6 p-4 rounded-xl bg-gray-50">
            <SingleImageUpload
              value={logo}
              onChange={setLogo}
              label="Logo"
              aspect="square"
              size="md"
            />
            <SingleImageUpload
              value={coverImage}
              onChange={setCoverImage}
              label="Image de couverture"
              aspect="cover"
              size="md"
            />
          </div>
        )}

        {/* Slug (readonly) */}
        {agency.slug && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Lien public
            </label>
            <p className="text-gray-600 text-sm">
              <code className="bg-gray-100 px-2 py-1 rounded">/agences/{agency.slug}</code>
            </p>
          </div>
        )}

        {/* Nom */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nom de l&apos;agence
          </label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
            />
          ) : (
            <p className="text-gray-900 font-medium">{agency.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
            />
          ) : (
            <p className="text-gray-600">{agency.email || "—"}</p>
          )}
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Téléphone
          </label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
            />
          ) : (
            <p className="text-gray-600">{agency.phone || "—"}</p>
          )}
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Adresse
          </label>
          {isEditing ? (
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={inputClass}
            />
          ) : (
            <p className="text-gray-600">{agency.address || "—"}</p>
          )}
        </div>

        {/* Site web */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Site web
          </label>
          {isEditing ? (
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://..."
              className={inputClass}
            />
          ) : agency.website ? (
            <a
              href={agency.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-950 hover:underline"
            >
              {agency.website.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            <p className="text-gray-600">—</p>
          )}
        </div>

        {/* Année de création */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Année de création
          </label>
          {isEditing ? (
            <input
              type="number"
              name="foundedYear"
              value={formData.foundedYear}
              onChange={handleChange}
              min={1900}
              max={new Date().getFullYear()}
              className={inputClass}
            />
          ) : (
            <p className="text-gray-600">{agency.foundedYear || "—"}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description
          </label>
          {isEditing ? (
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={inputClass}
            />
          ) : (
            <p className="text-gray-600 whitespace-pre-wrap">
              {agency.description || "—"}
            </p>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-primary-950 text-white font-semibold hover:bg-primary-900 disabled:opacity-50 transition-colors"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      )}
    </div>
  );
}
