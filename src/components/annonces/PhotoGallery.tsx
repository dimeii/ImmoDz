"use client";

import { useState, useEffect, useCallback } from "react";

interface Photo {
  id: string;
  url: string;
  category: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isOpen = lightboxIndex !== null;

  const close = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i + 1) % photos.length : null));
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null ? (i - 1 + photos.length) % photos.length : null
    );
  }, [photos.length]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close, goNext, goPrev]);

  if (photos.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-surface-container-low">
        <span className="material-symbols-outlined text-4xl text-outline-variant">
          image
        </span>
      </div>
    );
  }

  const mainPhoto = photos[0];
  const sidePhotos = photos.slice(1, 3);
  const remainingCount = photos.length - 3;

  return (
    <>
      {/* Editorial Grid */}
      <div className="grid grid-cols-12 gap-4 h-[500px]">
        {/* Main large photo */}
        <div
          className="col-span-12 md:col-span-8 h-full rounded-xl overflow-hidden relative group cursor-pointer"
          onClick={() => setLightboxIndex(0)}
        >
          <img
            src={mainPhoto.url}
            alt={mainPhoto.category}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Side photos */}
        {sidePhotos.length > 0 && (
          <div className="hidden md:flex col-span-4 flex-col gap-4 h-full">
            {sidePhotos.map((photo, i) => (
              <div
                key={photo.id}
                className="flex-1 rounded-xl overflow-hidden relative cursor-pointer"
                onClick={() => setLightboxIndex(i + 1)}
              >
                <img
                  src={photo.url}
                  alt={photo.category}
                  className="w-full h-full object-cover"
                />
                {/* "+N Photos" overlay on last side photo */}
                {i === sidePhotos.length - 1 && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/30 transition-colors">
                    <span className="text-white font-headline font-bold text-lg">
                      +{remainingCount} Photos
                    </span>
                  </div>
                )}
              </div>
            ))}
            {/* If only 1 side photo, fill the remaining space */}
            {sidePhotos.length === 1 && (
              <div
                className="flex-1 rounded-xl overflow-hidden bg-surface-container-low flex items-center justify-center cursor-pointer"
                onClick={() => setLightboxIndex(0)}
              >
                <span className="material-symbols-outlined text-3xl text-outline-variant">
                  photo_library
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={close}
        >
          <button
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            onClick={close}
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          <div className="absolute top-4 left-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm">
            {lightboxIndex! + 1} / {photos.length}
          </div>

          {photos.length > 1 && (
            <button
              className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
            >
              <span className="material-symbols-outlined">
                chevron_left
              </span>
            </button>
          )}

          <img
            key={lightboxIndex}
            src={photos[lightboxIndex!].url}
            alt={photos[lightboxIndex!].category}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          />

          {photos.length > 1 && (
            <button
              className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
            >
              <span className="material-symbols-outlined">
                chevron_right
              </span>
            </button>
          )}
        </div>
      )}
    </>
  );
}
