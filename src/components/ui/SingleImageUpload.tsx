"use client";

import { useRef, useState } from "react";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
  aspect?: "square" | "cover";
  size?: "sm" | "md" | "lg";
}

export default function SingleImageUpload({
  value,
  onChange,
  label,
  aspect = "square",
  size = "md",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dimensions = {
    sm: aspect === "cover" ? "h-24 w-full" : "w-16 h-16",
    md: aspect === "cover" ? "h-40 w-full" : "w-24 h-24",
    lg: aspect === "cover" ? "h-56 w-full" : "w-32 h-32",
  }[size];

  const shape = aspect === "cover" ? "rounded-xl" : "rounded-full";

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Fichier non image");
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

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error("upload");
      onChange(data.secure_url as string);
    } catch {
      setError("Erreur upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="flex items-start gap-4">
        <div
          className={`${dimensions} ${shape} bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400">Aucune image</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1.5 rounded-lg text-sm bg-primary-100 text-primary-950 font-semibold hover:bg-primary-200 disabled:opacity-50 transition-colors"
          >
            {uploading ? "Upload..." : value ? "Changer" : "Ajouter"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Supprimer
            </button>
          )}
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </div>
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
