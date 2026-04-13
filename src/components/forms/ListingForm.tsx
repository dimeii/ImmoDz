"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import PhotoUploadSection, { PhotoItem } from "./PhotoUploadSection";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Limites géographiques de l'Algérie
const ALGERIA_BOUNDS = {
  minLat: 18.96,
  maxLat: 37.1,
  minLng: -8.67,
  maxLng: 12.0,
};

function isInAlgeria(lat: number, lng: number): boolean {
  return (
    lat >= ALGERIA_BOUNDS.minLat &&
    lat <= ALGERIA_BOUNDS.maxLat &&
    lng >= ALGERIA_BOUNDS.minLng &&
    lng <= ALGERIA_BOUNDS.maxLng
  );
}

const propertyTypes = [
  { value: "APARTMENT", label: "Appartement" },
  { value: "HOUSE", label: "Maison" },
  { value: "VILLA", label: "Villa" },
  { value: "STUDIO", label: "Studio" },
  { value: "LAND", label: "Terrain" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "OFFICE", label: "Bureau" },
  { value: "GARAGE", label: "Garage" },
  { value: "OTHER", label: "Autre" },
];

interface ListingFormProps {
  mode: "create" | "edit";
  listing?: {
    id: string;
    title: string;
    description: string;
    price: number;
    transactionType: "RENT" | "SALE";
    propertyType: string;
    wilayaCode: number;
    commune?: string | null;
    address?: string | null;
    surface?: number | null;
    rooms?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    floor?: number | null;
    totalFloors?: number | null;
    yearBuilt?: number | null;
    hasElevator: boolean;
    hasParking: boolean;
    hasGarden: boolean;
    hasPool: boolean;
    isFurnished: boolean;
    hasStorefront: boolean;
    hasWater: boolean;
    hasElectricity: boolean;
    hasGas: boolean;
    hasFiber: boolean;
    latitude?: number | null;
    longitude?: number | null;
  };
}

export default function ListingForm({ mode, listing }: ListingFormProps) {
  const router = useRouter();
  const { data: wilayasData } = useSWR("/api/wilayas", fetcher);
  const wilayas: { code: number; name: string }[] = wilayasData ?? [];

  const [submitting, setSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Photos
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  // Form state
  const [title, setTitle] = useState(listing?.title ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [price, setPrice] = useState(listing?.price?.toString() ?? "");
  const [transactionType, setTransactionType] = useState<"RENT" | "SALE">(
    listing?.transactionType ?? "RENT"
  );
  const [propertyType, setPropertyType] = useState(
    listing?.propertyType ?? "APARTMENT"
  );
  const [wilayaCode, setWilayaCode] = useState(
    listing?.wilayaCode?.toString() ?? ""
  );
  const [commune, setCommune] = useState(listing?.commune ?? "");
  const [address, setAddress] = useState(listing?.address ?? "");
  const [surface, setSurface] = useState(listing?.surface?.toString() ?? "");
  const [rooms, setRooms] = useState(listing?.rooms?.toString() ?? "");
  const [bedrooms, setBedrooms] = useState(
    listing?.bedrooms?.toString() ?? ""
  );
  const [bathrooms, setBathrooms] = useState(
    listing?.bathrooms?.toString() ?? ""
  );
  const [floor, setFloor] = useState(listing?.floor?.toString() ?? "");
  const [totalFloors, setTotalFloors] = useState(
    listing?.totalFloors?.toString() ?? ""
  );
  const [yearBuilt, setYearBuilt] = useState(
    listing?.yearBuilt?.toString() ?? ""
  );
  const [hasElevator, setHasElevator] = useState(
    listing?.hasElevator ?? false
  );
  const [hasParking, setHasParking] = useState(listing?.hasParking ?? false);
  const [hasGarden, setHasGarden] = useState(listing?.hasGarden ?? false);
  const [hasPool, setHasPool] = useState(listing?.hasPool ?? false);
  const [isFurnished, setIsFurnished] = useState(
    listing?.isFurnished ?? false
  );
  const [hasStorefront, setHasStorefront] = useState(
    listing?.hasStorefront ?? false
  );
  const [hasWater, setHasWater] = useState(listing?.hasWater ?? false);
  const [hasElectricity, setHasElectricity] = useState(
    listing?.hasElectricity ?? false
  );
  const [hasGas, setHasGas] = useState(listing?.hasGas ?? false);
  const [hasFiber, setHasFiber] = useState(listing?.hasFiber ?? false);

  // Géolocalisation
  const [lat, setLat] = useState<number | null>(listing?.latitude ?? null);
  const [lng, setLng] = useState<number | null>(listing?.longitude ?? null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const [locationWarning, setLocationWarning] = useState("");

  // Mini-carte
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const checkAlgeria = useCallback((pLat: number, pLng: number) => {
    if (!isInAlgeria(pLat, pLng)) {
      setLocationWarning(
        "Ce point est en dehors de l'Algérie. Vérifiez la position du repère."
      );
    } else {
      setLocationWarning("");
    }
  }, []);

  const updateMarker = useCallback((newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    checkAlgeria(newLat, newLng);
    if (markerRef.current) {
      markerRef.current.setLngLat([newLng, newLat]);
    } else if (mapRef.current) {
      markerRef.current = new mapboxgl.Marker({ color: "#064e3b", draggable: true })
        .setLngLat([newLng, newLat])
        .addTo(mapRef.current);
      markerRef.current.on("dragend", () => {
        const pos = markerRef.current!.getLngLat();
        setLat(pos.lat);
        setLng(pos.lng);
        checkAlgeria(pos.lat, pos.lng);
      });
    }
  }, [checkAlgeria]);

  // Initialiser la mini-carte
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng ?? 3.042, lat ?? 36.752],
      zoom: lat && lng ? 14 : 5,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("click", (e) => {
      updateMarker(e.lngLat.lat, e.lngLat.lng);
    });

    if (lat && lng) {
      updateMarker(lat, lng);
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Géocodage via Nominatim (OpenStreetMap, gratuit)
  const handleGeocode = async () => {
    const selectedWilaya = wilayas.find((w) => w.code === Number(wilayaCode));
    const query = [address, commune, selectedWilaya?.name, "Algérie"]
      .filter(Boolean)
      .join(", ");

    if (!query || !wilayaCode) {
      setGeocodeError("Saisissez au moins une wilaya");
      return;
    }

    setGeocoding(true);
    setGeocodeError("");

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=dz`,
        { headers: { "User-Agent": "ImmoDz/1.0" } }
      );
      const results = await res.json();

      if (results.length === 0) {
        setGeocodeError("Adresse non trouvée. Cliquez sur la carte pour placer le repère manuellement.");
        return;
      }

      const { lat: rLat, lon: rLng } = results[0];
      const newLat = parseFloat(rLat);
      const newLng = parseFloat(rLng);

      updateMarker(newLat, newLng);

      if (mapRef.current) {
        mapRef.current.flyTo({ center: [newLng, newLat], zoom: 15 });
      }
    } catch {
      setGeocodeError("Erreur de géocodage. Placez le repère manuellement sur la carte.");
    } finally {
      setGeocoding(false);
    }
  };

  const isCommercial = ["COMMERCIAL", "OFFICE"].includes(propertyType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Vérification géographique avant soumission
    if (lat != null && lng != null && !isInAlgeria(lat, lng)) {
      setError(
        "Les coordonnées GPS saisies ne sont pas situées en Algérie. Repositionnez le repère sur la carte."
      );
      return;
    }

    setSubmitting(true);

    const body: Record<string, unknown> = {
      title,
      description,
      price: Number(price),
      transactionType,
      propertyType,
      wilayaCode: Number(wilayaCode),
      hasElevator,
      hasParking,
      hasGarden,
      hasPool,
      isFurnished,
      hasStorefront,
      hasWater,
      hasElectricity,
      hasGas,
      hasFiber,
    };

    if (lat != null) body.lat = lat;
    if (lng != null) body.lng = lng;
    if (commune) body.commune = commune;
    if (address) body.address = address;
    if (surface) body.surface = Number(surface);
    if (rooms) body.rooms = Number(rooms);
    if (bedrooms) body.bedrooms = Number(bedrooms);
    if (bathrooms) body.bathrooms = Number(bathrooms);
    if (floor) body.floor = Number(floor);
    if (totalFloors) body.totalFloors = Number(totalFloors);
    if (yearBuilt) body.yearBuilt = Number(yearBuilt);

    try {
      const url =
        mode === "create" ? "/api/annonces" : `/api/annonces/${listing!.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details?.issues) {
          const errs: Record<string, string> = {};
          for (const issue of data.details.issues) {
            const field = issue.path?.[0];
            if (field) errs[field] = issue.message;
          }
          setFieldErrors(errs);
        }
        setError(data.error || "Erreur lors de la soumission");
        setSubmitting(false);
        return;
      }

      const listingId: string = data.id;

      // Upload photos si présentes
      if (photos.length > 0) {
        setUploadStep(`Préparation des photos…`);

        const sigRes = await fetch("/api/upload/signature", { method: "POST" });
        if (!sigRes.ok) {
          setError("Impossible d'obtenir la signature d'upload");
          setSubmitting(false);
          return;
        }
        const sig = await sigRes.json();

        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          setUploadStep(`Upload photo ${i + 1}/${photos.length}…`);

          const formData = new FormData();
          formData.append("file", photo.file);
          formData.append("api_key", sig.api_key);
          formData.append("timestamp", sig.timestamp);
          formData.append("signature", sig.signature);
          formData.append("folder", sig.folder);

          const cloudRes = await fetch(
            `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
            { method: "POST", body: formData }
          );
          const cloudData = await cloudRes.json();

          if (!cloudData.secure_url) continue;

          await fetch(`/api/annonces/${listingId}/photos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: cloudData.secure_url,
              publicId: cloudData.public_id,
              category: photo.category,
              order: i,
            }),
          });
        }
      }

      router.push(`/annonces/${listingId}`);
    } catch {
      setError("Erreur réseau");
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-950 focus:ring-1 focus:ring-primary-950 outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const errorClass = "text-xs text-red-600 mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ─── Section 1 : Infos principales ─── */}
      <section>
        <h3 className="text-base font-bold text-primary-950 mb-4 border-b border-primary-100 pb-2">
          Informations principales
        </h3>
        <div className="space-y-4">
          {/* Type de transaction */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTransactionType("RENT")}
              className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                transactionType === "RENT"
                  ? "bg-primary-950 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Location
            </button>
            <button
              type="button"
              onClick={() => setTransactionType("SALE")}
              className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                transactionType === "SALE"
                  ? "bg-accent-red text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Vente
            </button>
          </div>

          {/* Titre */}
          <div>
            <label className={labelClass}>Titre *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Bel appartement F3 - Hydra"
              className={inputClass}
              required
            />
            {fieldErrors.title && (
              <p className={errorClass}>{fieldErrors.title}</p>
            )}
          </div>

          {/* Type de bien */}
          <div>
            <label className={labelClass}>Type de bien *</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className={inputClass}
            >
              {propertyTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Prix */}
          <div>
            <label className={labelClass}>
              Prix (DA) {transactionType === "RENT" && "/ mois"} *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: 85000"
              className={inputClass}
              min="0"
              required
            />
            {fieldErrors.price && (
              <p className={errorClass}>{fieldErrors.price}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre bien en détail (min. 20 caractères)..."
              className={inputClass + " h-32 resize-none"}
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              {description.length}/5000
            </p>
            {fieldErrors.description && (
              <p className={errorClass}>{fieldErrors.description}</p>
            )}
          </div>
        </div>
      </section>

      {/* ─── Section 2 : Localisation ─── */}
      <section>
        <h3 className="text-base font-bold text-primary-950 mb-4 border-b border-primary-100 pb-2">
          Localisation
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Wilaya *</label>
              <select
                value={wilayaCode}
                onChange={(e) => setWilayaCode(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">Sélectionner...</option>
                {wilayas.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
              {fieldErrors.wilayaCode && (
                <p className={errorClass}>{fieldErrors.wilayaCode}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Commune</label>
              <input
                type="text"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                placeholder="Ex: Hydra"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Adresse</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Rue des frères Bouchnak"
              className={inputClass}
            />
          </div>

          {/* Géocodage + Mini-carte */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass + " mb-0"}>
                Position sur la carte
              </label>
              <button
                type="button"
                onClick={handleGeocode}
                disabled={geocoding}
                className="px-4 py-1.5 rounded-lg bg-primary-100 text-primary-950 text-sm font-semibold hover:bg-primary-200 disabled:opacity-50 transition-colors"
              >
                {geocoding ? "Recherche..." : "Localiser l'adresse"}
              </button>
            </div>
            {geocodeError && (
              <p className="text-xs text-amber-600 mb-2">{geocodeError}</p>
            )}
            {lat && lng && !locationWarning && (
              <p className="text-xs text-green-700 mb-2">
                Position : {lat.toFixed(5)}, {lng.toFixed(5)} — Déplacez le repère pour ajuster
              </p>
            )}
            {locationWarning && (
              <p className="text-xs text-red-600 mb-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {locationWarning}
              </p>
            )}
            <div
              ref={mapContainerRef}
              className={`w-full h-64 rounded-lg overflow-hidden border ${locationWarning ? "border-red-400" : "border-gray-300"}`}
            />
            <p className="text-xs text-gray-400 mt-1">
              Cliquez sur la carte ou utilisez le bouton &quot;Localiser&quot; pour positionner votre bien
            </p>
          </div>
        </div>
      </section>

      {/* ─── Section 3 : Caractéristiques ─── */}
      <section>
        <h3 className="text-base font-bold text-primary-950 mb-4 border-b border-primary-100 pb-2">
          Caractéristiques
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Surface (m²)</label>
            <input
              type="number"
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
              placeholder="110"
              className={inputClass}
              min="0"
            />
          </div>
          <div>
            <label className={labelClass}>Pièces</label>
            <input
              type="number"
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              placeholder="3"
              className={inputClass}
              min="0"
            />
          </div>
          <div>
            <label className={labelClass}>Chambres</label>
            <input
              type="number"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              placeholder="2"
              className={inputClass}
              min="0"
            />
          </div>
          <div>
            <label className={labelClass}>Salles de bain</label>
            <input
              type="number"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              placeholder="1"
              className={inputClass}
              min="0"
            />
          </div>
          <div>
            <label className={labelClass}>Etage</label>
            <input
              type="number"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="4"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Etages total</label>
            <input
              type="number"
              value={totalFloors}
              onChange={(e) => setTotalFloors(e.target.value)}
              placeholder="10"
              className={inputClass}
              min="0"
            />
          </div>
          <div>
            <label className={labelClass}>Année construction</label>
            <input
              type="number"
              value={yearBuilt}
              onChange={(e) => setYearBuilt(e.target.value)}
              placeholder="2020"
              className={inputClass}
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
        </div>
      </section>

      {/* ─── Section 4 : Équipements ─── */}
      <section>
        <h3 className="text-base font-bold text-primary-950 mb-4 border-b border-primary-100 pb-2">
          Equipements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Ascenseur",
              checked: hasElevator,
              onChange: setHasElevator,
            },
            { label: "Parking", checked: hasParking, onChange: setHasParking },
            { label: "Jardin", checked: hasGarden, onChange: setHasGarden },
            { label: "Piscine", checked: hasPool, onChange: setHasPool },
            { label: "Meublé", checked: isFurnished, onChange: setIsFurnished },
            { label: "Fibre optique", checked: hasFiber, onChange: setHasFiber },
          ].map((item) => (
            <label
              key={item.label}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                item.checked
                  ? "bg-primary-50 border-primary-950 text-primary-950"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.onChange(e.target.checked)}
                className="accent-primary-950"
              />
              <span className="text-sm font-medium">{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* ─── Section 5 : Options local commercial ─── */}
      {isCommercial && (
        <section>
          <h3 className="text-base font-bold text-primary-950 mb-4 border-b border-primary-100 pb-2">
            Options local commercial
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              {
                label: "Devanture",
                checked: hasStorefront,
                onChange: setHasStorefront,
              },
              {
                label: "Accès eau",
                checked: hasWater,
                onChange: setHasWater,
              },
              {
                label: "Accès électricité",
                checked: hasElectricity,
                onChange: setHasElectricity,
              },
              {
                label: "Accès gaz",
                checked: hasGas,
                onChange: setHasGas,
              },
            ].map((item) => (
              <label
                key={item.label}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                  item.checked
                    ? "bg-primary-50 border-primary-950 text-primary-950"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.onChange(e.target.checked)}
                  className="accent-primary-950"
                />
                <span className="text-sm font-medium">{item.label}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      {/* ─── Section Photos ─── */}
      <section>
        <h3 className="text-base font-bold text-primary-950 mb-1 border-b border-primary-100 pb-2">
          Photos
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Ajoutez des photos et précisez la pièce pour chacune (salon, chambre, cuisine…).
          La première photo sera la photo principale.
        </p>
        <PhotoUploadSection
          photos={photos}
          onChange={setPhotos}
          maxPhotos={10}
        />
      </section>

      {/* ─── Submit ─── */}
      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={submitting}
          className="px-6 py-3 rounded-lg border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-6 py-3 rounded-lg bg-primary-950 text-white text-sm font-semibold hover:bg-primary-900 transition-colors disabled:opacity-50"
        >
          {submitting
            ? (uploadStep ?? "Publication…")
            : mode === "create"
              ? "Publier l'annonce"
              : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
