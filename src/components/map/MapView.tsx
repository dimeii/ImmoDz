"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import Supercluster from "supercluster";
import useSWR from "swr";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// Centre de l'Algérie
const DEFAULT_CENTER: [number, number] = [2.6325, 28.1636];
const DEFAULT_ZOOM = 5;

interface PinProperties {
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
}

export default function MapView({ filters, onBoundsChange }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
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

    cluster.load(geojson.features as GeoPoint[]);

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
        // Cluster pin
        const count = props.point_count as number;
        el.className =
          "flex items-center justify-center rounded-full bg-blue-500 text-white text-sm font-bold shadow-lg cursor-pointer";
        el.style.width = `${32 + Math.min(count, 100) * 0.3}px`;
        el.style.height = `${32 + Math.min(count, 100) * 0.3}px`;
        el.textContent = String(count);

        el.addEventListener("click", () => {
          const expansionZoom = cluster.getClusterExpansionZoom(
            feature.id as number
          );
          map.current?.flyTo({ center: [lng, lat], zoom: expansionZoom });
        });
      } else {
        // Single pin
        const price = props.price as number;
        const isSale = props.transactionType === "SALE";
        el.className = `rounded-full px-2 py-1 text-xs font-semibold text-white shadow-md cursor-pointer ${
          isSale ? "bg-green-600" : "bg-blue-600"
        }`;
        el.textContent = `${price.toLocaleString("fr-DZ")} ${isSale ? "DA" : "DA/m"}`;

        el.addEventListener("click", () => {
          window.location.href = `/annonces/${props.id}`;
        });
      }

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    }
  }, [geojson, zoom]);

  return (
    <div ref={mapContainer} className="h-full w-full rounded-lg" />
  );
}
