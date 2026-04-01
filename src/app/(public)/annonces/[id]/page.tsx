import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import PhotoGallery from "@/components/annonces/PhotoGallery";
import ContactForm from "@/components/annonces/ContactForm";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
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

export default async function AnnoncePage({
  params,
}: {
  params: { id: string };
}) {
  const annonce = await db.listing.findUnique({
    where: { id: params.id, status: "ACTIVE" },
    include: {
      wilaya: true,
      photos: { orderBy: { order: "asc" } },
      user: { select: { name: true, image: true } },
    },
  });

  if (!annonce) notFound();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          <PhotoGallery
            photos={annonce.photos.map((p) => ({
              id: p.id,
              url: p.url,
              category: p.category,
            }))}
          />

          {/* Titre et prix */}
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                  annonce.transactionType === "SALE"
                    ? "bg-green-600"
                    : "bg-blue-600"
                }`}
              >
                {annonce.transactionType === "SALE" ? "Vente" : "Location"}
              </span>
              <span className="text-sm text-gray-500">
                {PROPERTY_TYPE_LABELS[annonce.propertyType] ?? annonce.propertyType}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              {annonce.title}
            </h1>
            <p className="mt-1 text-3xl font-bold text-primary-600">
              {annonce.price.toLocaleString("fr-DZ")} DA
              {annonce.transactionType === "RENT" && (
                <span className="text-lg font-normal text-gray-500">/mois</span>
              )}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {annonce.wilaya.name}
              {annonce.commune && ` — ${annonce.commune}`}
              {annonce.address && `, ${annonce.address}`}
            </p>
          </div>

          {/* Caractéristiques */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-4">
            {annonce.surface && (
              <div>
                <p className="text-sm text-gray-500">Surface</p>
                <p className="font-semibold">{annonce.surface} m²</p>
              </div>
            )}
            {annonce.rooms && (
              <div>
                <p className="text-sm text-gray-500">Pièces</p>
                <p className="font-semibold">{annonce.rooms}</p>
              </div>
            )}
            {annonce.bedrooms !== null && (
              <div>
                <p className="text-sm text-gray-500">Chambres</p>
                <p className="font-semibold">{annonce.bedrooms}</p>
              </div>
            )}
            {annonce.bathrooms !== null && (
              <div>
                <p className="text-sm text-gray-500">Salles de bain</p>
                <p className="font-semibold">{annonce.bathrooms}</p>
              </div>
            )}
            {annonce.floor !== null && (
              <div>
                <p className="text-sm text-gray-500">Étage</p>
                <p className="font-semibold">
                  {annonce.floor}
                  {annonce.totalFloors && `/${annonce.totalFloors}`}
                </p>
              </div>
            )}
            {annonce.yearBuilt && (
              <div>
                <p className="text-sm text-gray-500">Année</p>
                <p className="font-semibold">{annonce.yearBuilt}</p>
              </div>
            )}
          </div>

          {/* Équipements */}
          <div className="flex flex-wrap gap-2">
            {annonce.hasElevator && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">Ascenseur</span>
            )}
            {annonce.hasParking && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">Parking</span>
            )}
            {annonce.hasGarden && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">Jardin</span>
            )}
            {annonce.hasPool && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">Piscine</span>
            )}
            {annonce.isFurnished && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">Meublé</span>
            )}
            {annonce.hasFiber && (
              <span className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-sm">Fibre optique</span>
            )}
            {annonce.hasStorefront && (
              <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-sm">Devanture</span>
            )}
            {annonce.hasWater && (
              <span className="rounded-full bg-cyan-100 text-cyan-800 px-3 py-1 text-sm">Eau</span>
            )}
            {annonce.hasElectricity && (
              <span className="rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 text-sm">Électricité</span>
            )}
            {annonce.hasGas && (
              <span className="rounded-full bg-orange-100 text-orange-800 px-3 py-1 text-sm">Gaz</span>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Description</h2>
            <p className="mt-2 whitespace-pre-line text-gray-700">
              {annonce.description}
            </p>
          </div>
        </div>

        {/* Sidebar contact */}
        <aside className="space-y-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                {annonce.user.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="font-medium text-gray-900">{annonce.user.name}</p>
                <p className="text-xs text-gray-500">Annonceur</p>
              </div>
            </div>
            <ContactForm listingId={annonce.id} />
          </div>
        </aside>
      </div>
    </main>
  );
}
