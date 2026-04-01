"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import Supercluster from "supercluster";
import useSWR from "swr";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// Centre d'Alger
const DEFAULT_CENTER: [number, number] = [3.0588, 36.737];
const DEFAULT_ZOOM = 11;

export interface PinProperties {
  id: string;
  title: string;
  price: number;
  transactionType: string;
  propertyType: string;
  thumbnail?: string;
}

type GeoPoint = GeoJSON.Feature<GeoJSON.Point, PinProperties>;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface MapViewProps {
  filters?: Record<string, string>;
  onBoundsChange?: (bounds: [number, number, number, number]) => void;
  onPinClick?: (listings: PinProperties[]) => void;
}

export default function MapView({
  filters,
  onBoundsChange,
  onPinClick,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const clusterRef = useRef<Supercluster<PinProperties> | null>(null);
  const featuresRef = useRef<GeoPoint[]>([]);
  const [bounds, setBounds] = useState<string>("");
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  // Construire l'URL avec filtres
  const queryParams = new URLSearchParams();
  if (bounds) queryParams.set("bounds", bounds);
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.set(key, value);
    });
  }

  const { data: geojson } = useSWR(
    bounds ? `/api/map/pins?${queryParams.toString()}` : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const updateBounds = useCallback(() => {
    if (!map.current) return;
    const b = map.current.getBounds();
    if (!b) return;
    const boundsArray: [number, number, number, number] = [
      b.getWest(),
      b.getSouth(),
      b.getEast(),
      b.getNorth(),
    ];
    setBounds(boundsArray.join(","));
    setZoom(Math.floor(map.current.getZoom()));
    onBoundsChange?.(boundsArray);
  }, [onBoundsChange]);

  // Initialiser la carte
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", updateBounds);
    map.current.on("moveend", updateBounds);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [updateBounds]);

  // Clustering + markers
  useEffect(() => {
    if (!map.current || !geojson?.features) return;

    // Nettoyer les anciens markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const cluster = new Supercluster<PinProperties>({
      radius: 60,
      maxZoom: 16,
    });

    const points = geojson.features as GeoPoint[];
    cluster.load(points);
    clusterRef.current = cluster;
    featuresRef.current = points;

    const b = map.current.getBounds();
    if (!b) return;
    const clusters = cluster.getClusters(
      [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
      zoom
    );

    for (const feature of clusters) {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties as Record<string, unknown>;

      const el = document.createElement("div");

      if (props.cluster) {
        // Cluster pin — cercle vert avec nombre
        const count = props.point_count as number;
        const size = 36 + Math.min(count, 50) * 0.5;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = "50%";
        el.style.background = "#007B30";
        el.style.border = "3px solid white";
        el.style.color = "white";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.fontSize = "13px";
        el.style.fontWeight = "700";
        el.style.cursor = "pointer";
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
        el.textContent = String(count);

        el.addEventListener("click", () => {
          if (!clusterRef.current) return;
          // Récupérer toutes les annonces du cluster
          const leaves = clusterRef.current.getLeaves(
            feature.id as number,
            Infinity
          );
          const listings = leaves.map(
            (l) => l.properties as PinProperties
          );
          onPinClick?.(listings);
        });
      } else {
        // Single pin — petit cercle vert avec wrapper pour le hover
        const isSale = props.transactionType === "SALE";
        el.style.width = "24px";
        el.style.height = "24px";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.cursor = "pointer";

        const dot = document.createElement("div");
        dot.style.width = "16px";
        dot.style.height = "16px";
        dot.style.borderRadius = "50%";
        dot.style.background = isSale ? "#C9082A" : "#007B30";
        dot.style.border = "3px solid white";
        dot.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        dot.style.transition = "width 150ms, height 150ms";
        el.appendChild(dot);

        el.addEventListener("mouseenter", () => {
          dot.style.width = "22px";
          dot.style.height = "22px";
        });
        el.addEventListener("mouseleave", () => {
          dot.style.width = "16px";
          dot.style.height = "16px";
        });

        el.addEventListener("click", () => {
          onPinClick?.([props as unknown as PinProperties]);
        });
      }

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    }
  }, [geojson, zoom, onPinClick]);

  return <div ref={mapContainer} className="h-full w-full" />;
}
