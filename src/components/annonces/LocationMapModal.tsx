"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface LocationMapModalProps {
  lng: number;
  lat: number;
  title: string;
  locationLabel: string;
  /** Static map image URL shown as the clickable trigger */
  staticMapUrl: string;
}

export default function LocationMapModal({
  lng,
  lat,
  title,
  locationLabel,
  staticMapUrl,
}: LocationMapModalProps) {
  const [open, setOpen] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const initMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 14,
    });

    m.addControl(new mapboxgl.NavigationControl(), "top-right");
    m.addControl(new mapboxgl.FullscreenControl(), "top-right");

    // Marker
    const el = document.createElement("div");
    el.style.width = "40px";
    el.style.height = "40px";
    el.style.borderRadius = "50%";
    el.style.background = "#003527";
    el.style.border = "4px solid white";
    el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.innerHTML =
      '<span class="material-symbols-outlined" style="color:white;font-size:20px;font-variation-settings:\'FILL\' 1">location_on</span>';

    new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(m);

    map.current = m;
  }, [lng, lat]);

  useEffect(() => {
    if (open) {
      // Small delay so the container is rendered
      const timer = setTimeout(initMap, 50);
      return () => clearTimeout(timer);
    } else {
      map.current?.remove();
      map.current = null;
    }
  }, [open, initMap]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      {/* Clickable static map trigger */}
      <section
        onClick={() => setOpen(true)}
        className="rounded-2xl overflow-hidden editorial-shadow h-80 relative group cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(true);
        }}
      >
        <img
          src={staticMapUrl}
          alt={`Carte — ${locationLabel}`}
          className="w-full h-full object-cover grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white ring-8 ring-primary/20">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              location_on
            </span>
          </div>
        </div>
        {/* Hover hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/80 text-white text-xs font-semibold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">open_in_full</span>
          Ouvrir la carte interactive
        </div>
      </section>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="relative w-[95vw] h-[85vh] max-w-6xl bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/15">
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  {title}
                </h3>
                <p className="text-sm text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    location_on
                  </span>
                  {locationLabel}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Map */}
            <div ref={mapContainer} className="flex-1 w-full" />
          </div>
        </div>
      )}
    </>
  );
}
