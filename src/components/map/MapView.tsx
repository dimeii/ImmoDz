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

// Coordonnées des chefs-lieux des 58 wilayas [lng, lat]
const WILAYA_CENTERS: Record<number, [number, number]> = {
  1:  [-0.29, 27.87],  // Adrar
  2:  [1.33, 36.16],   // Chlef
  3:  [2.88, 33.80],   // Laghouat
  4:  [7.11, 35.88],   // Oum El Bouaghi
  5:  [6.17, 35.56],   // Batna
  6:  [5.07, 36.75],   // Béjaïa
  7:  [5.73, 34.85],   // Biskra
  8:  [-2.22, 31.62],  // Béchar
  9:  [2.83, 36.47],   // Blida
  10: [3.90, 36.38],   // Bouira
  11: [5.52, 22.79],   // Tamanrasset
  12: [8.12, 35.40],   // Tébessa
  13: [-1.32, 34.88],  // Tlemcen
  14: [1.32, 35.37],   // Tiaret
  15: [4.05, 36.71],   // Tizi Ouzou
  16: [3.06, 36.74],   // Alger
  17: [3.25, 34.67],   // Djelfa
  18: [5.77, 36.82],   // Jijel
  19: [5.41, 36.19],   // Sétif
  20: [0.15, 34.83],   // Saïda
  21: [6.91, 36.87],   // Skikda
  22: [-0.64, 35.19],  // Sidi Bel Abbès
  23: [7.77, 36.90],   // Annaba
  24: [7.43, 36.46],   // Guelma
  25: [6.61, 36.36],   // Constantine
  26: [2.75, 36.26],   // Médéa
  27: [0.09, 35.93],   // Mostaganem
  28: [4.54, 35.70],   // M'Sila
  29: [0.14, 35.40],   // Mascara
  30: [5.33, 31.95],   // Ouargla
  31: [-0.64, 35.70],  // Oran
  32: [1.00, 33.68],   // El Bayadh
  33: [8.48, 26.50],   // Illizi
  34: [4.76, 36.07],   // Bordj Bou Arréridj
  35: [3.47, 36.76],   // Boumerdès
  36: [8.32, 36.77],   // El Tarf
  37: [-8.13, 27.67],  // Tindouf
  38: [1.81, 35.61],   // Tissemsilt
  39: [6.86, 33.37],   // El Oued
  40: [7.14, 35.43],   // Khenchela
  41: [7.95, 36.29],   // Souk Ahras
  42: [2.45, 36.59],   // Tipaza
  43: [6.26, 36.45],   // Mila
  44: [1.97, 36.26],   // Aïn Defla
  45: [-0.30, 33.26],  // Naâma
  46: [-1.14, 35.29],  // Aïn Témouchent
  47: [3.68, 32.49],   // Ghardaïa
  48: [0.94, 35.73],   // Relizane
  49: [5.93, 33.95],   // El M'Ghair
  50: [2.88, 30.58],   // El Menia
  51: [5.07, 34.42],   // Ouled Djellal
  52: [0.95, 21.33],   // Bordj Badji Mokhtar
  53: [-2.17, 30.13],  // Béni Abbès
  54: [0.23, 29.26],   // Timimoun
  55: [6.06, 33.10],   // Touggourt
  56: [9.48, 24.55],   // Djanet
  57: [2.47, 27.19],   // In Salah
  58: [5.77, 19.57],   // In Guezzam
};

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

  // Centrer la carte sur la wilaya sélectionnée
  useEffect(() => {
    if (!map.current) return;

    const wilayaCode = filters?.wilayaCode;
    if (!wilayaCode) {
      // Retour à la vue par défaut si aucune wilaya sélectionnée
      map.current.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, duration: 1200 });
      return;
    }

    const code = parseInt(wilayaCode, 10);
    const center = WILAYA_CENTERS[code];
    if (!center) return;

    map.current.flyTo({ center, zoom: 12, duration: 1200 });
  }, [filters?.wilayaCode]);

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
