"use client";

import { useCallback, useRef, useState } from "react";

export type RoomCategory =
  | "LIVING_ROOM"
  | "BEDROOM"
  | "KITCHEN"
  | "BATHROOM"
  | "EXTERIOR"
  | "OTHER";

export interface PhotoItem {
  file: File;
  preview: string;
  category: RoomCategory;
}

const CATEGORY_LABELS: Record<RoomCategory, string> = {
  LIVING_ROOM: "Salon / Séjour",
  BEDROOM: "Chambre",
  KITCHEN: "Cuisine",
  BATHROOM: "Salle de bain",
  EXTERIOR: "Extérieur",
  OTHER: "Autre",
};

interface Props {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
}

export default function PhotoUploadSection({
  photos,
  onChange,
  maxPhotos = 10,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxPhotos - photos.length;
      const toAdd = fileArray
        .slice(0, remaining)
        .filter((f) => f.type.startsWith("image/"));

      const newPhotos: PhotoItem[] = toAdd.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        category: "OTHER",
      }));

      onChange([...photos, ...newPhotos]);
    },
    [photos, onChange, maxPhotos]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photos[index].preview);
    onChange(photos.filter((_, i) => i !== index));
  };

  const setCategory = (index: number, category: RoomCategory) => {
    onChange(photos.map((p, i) => (i === index ? { ...p, category } : p)));
  };

  const isFull = photos.length >= maxPhotos;

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {!isFull && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragging
              ? "border-primary-950 bg-primary-50"
              : "border-gray-300 hover:border-primary-950 hover:bg-primary-50/30"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2 text-gray-400">
            {/* Upload icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm font-medium text-gray-600">
              {dragging
                ? "Relâchez pour ajouter"
                : "Cliquez ou glissez-déposez des photos"}
            </p>
            <p className="text-xs">
              {photos.length}/{maxPhotos} photos — JPG, PNG, WEBP
            </p>
          </div>
        </div>
      )}

      {isFull && (
        <p className="text-xs text-amber-600 text-center py-2">
          Limite de {maxPhotos} photos atteinte.
        </p>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <div
              key={photo.preview}
              className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex flex-col"
            >
              {/* Preview */}
              <div className="relative aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {/* Position badge */}
                <span className="absolute top-1 left-1 bg-black/60 text-white text-xs font-bold rounded px-1.5 py-0.5 leading-none">
                  {i + 1}
                </span>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label="Supprimer la photo"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Category selector */}
              <select
                value={photo.category}
                onChange={(e) => setCategory(i, e.target.value as RoomCategory)}
                className="w-full text-xs border-t border-gray-200 px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-950 focus:border-primary-950"
              >
                {(Object.entries(CATEGORY_LABELS) as [RoomCategory, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>
          ))}
        </div>
      )}

      {photos.length > 0 && (
        <p className="text-xs text-gray-400">
          La première photo sera utilisée comme photo principale de l&apos;annonce.
        </p>
      )}
    </div>
  );
}
