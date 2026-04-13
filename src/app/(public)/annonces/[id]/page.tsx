import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import PhotoGallery from "@/components/annonces/PhotoGallery";
import ContactForm from "@/components/annonces/ContactForm";
import LocationMapModal from "@/components/annonces/LocationMapModal";

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

const AMENITY_MAP: {
  key: string;
  label: string;
  icon: string;
}[] = [
  { key: "hasElevator", label: "Ascenseur", icon: "elevator" },
  { key: "hasParking", label: "Parking", icon: "local_parking" },
  { key: "hasGarden", label: "Jardin", icon: "yard" },
  { key: "hasPool", label: "Piscine", icon: "pool" },
  { key: "isFurnished", label: "Meublé", icon: "chair" },
  { key: "hasFiber", label: "Fibre optique", icon: "lan" },
  { key: "hasStorefront", label: "Devanture", icon: "storefront" },
  { key: "hasWater", label: "Eau", icon: "water_drop" },
  { key: "hasElectricity", label: "Électricité", icon: "bolt" },
  { key: "hasGas", label: "Gaz", icon: "local_fire_department" },
];

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
      user: { select: { id: true, name: true, image: true } },
    },
  });

  if (!annonce) notFound();

  const activeAmenities = AMENITY_MAP.filter(
    (a) => (annonce as Record<string, unknown>)[a.key] === true
  );

  const characteristics: { icon: string; label: string; value: string }[] = [];

  if (annonce.bedrooms != null) {
    characteristics.push({
      icon: "bed",
      label: "Chambres",
      value: `${annonce.bedrooms}`,
    });
  }
  if (annonce.bathrooms != null) {
    characteristics.push({
      icon: "bathtub",
      label: "Salles de bain",
      value: `${annonce.bathrooms}`,
    });
  }
  if (annonce.surface) {
    characteristics.push({
      icon: "straighten",
      label: "Surface",
      value: `${annonce.surface}m²`,
    });
  }
  if (annonce.rooms) {
    characteristics.push({
      icon: "meeting_room",
      label: "Pièces",
      value: `${annonce.rooms}`,
    });
  }
  if (annonce.floor != null) {
    characteristics.push({
      icon: "stairs",
      label: "Étage",
      value: annonce.totalFloors
        ? `${annonce.floor}/${annonce.totalFloors}`
        : `${annonce.floor}`,
    });
  }
  if (annonce.yearBuilt) {
    characteristics.push({
      icon: "calendar_month",
      label: "Année",
      value: `${annonce.yearBuilt}`,
    });
  }

  return (
    <main className="pb-12 max-w-screen-2xl mx-auto px-6 md:px-12 pt-8">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* ============ MAIN CONTENT (2/3) ============ */}
        <div className="w-full lg:w-2/3">
          {/* Gallery */}
          <section className="mb-12">
            <PhotoGallery
              photos={annonce.photos.map((p) => ({
                id: p.id,
                url: p.url,
                category: p.category,
              }))}
            />
          </section>

          {/* Headline */}
          <section className="mb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant/15 pb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-primary font-headline font-bold tracking-widest text-xs uppercase">
                    {PROPERTY_TYPE_LABELS[annonce.propertyType] ??
                      annonce.propertyType}
                  </p>
                  {annonce.surPlan && (
                    <span className="inline-flex items-center gap-1 bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm">
                        architecture
                      </span>
                      Sur plan
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-primary tracking-tighter mb-2">
                  {annonce.title}
                </h1>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg">
                    location_on
                  </span>
                  <span className="font-medium">
                    {annonce.wilaya.name}
                    {annonce.commune && `, ${annonce.commune}`}
                    {annonce.address && ` — ${annonce.address}`}
                  </span>
                </div>
              </div>
              <div className="text-left md:text-right flex-shrink-0">
                <div className="text-primary font-headline font-extrabold text-3xl md:text-4xl tracking-tight">
                  {annonce.price.toLocaleString("fr-DZ")} DA
                </div>
                <div className="text-on-surface-variant text-sm font-medium">
                  {annonce.transactionType === "RENT"
                    ? "Par mois"
                    : "Prix de vente"}
                </div>
              </div>
            </div>
          </section>

          {/* Characteristics Grid */}
          {characteristics.length > 0 && (
            <section className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-6 bg-surface-container-low p-8 rounded-xl">
              {characteristics.map((c, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    {c.icon}
                  </span>
                  <span className="text-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                    {c.label}
                  </span>
                  <span className="text-xl font-headline font-bold text-primary">
                    {c.value}
                  </span>
                </div>
              ))}
            </section>
          )}

          {/* Amenities & Description */}
          <section className="mb-12 space-y-10">
            {/* Amenity pills */}
            {activeAmenities.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {activeAmenities.map((a) => (
                  <span
                    key={a.key}
                    className="bg-primary-fixed-dim/30 text-on-primary-fixed-variant px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2"
                  >
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {a.icon}
                    </span>
                    {a.label}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {annonce.description && (
              <div>
                <h3 className="text-2xl font-headline font-bold text-primary mb-4">
                  Description de la Propriété
                </h3>
                <p className="text-lg leading-relaxed text-on-surface-variant font-headline font-light whitespace-pre-line">
                  {annonce.description}
                </p>
              </div>
            )}
          </section>

          {/* Map Section */}
          <LocationMapModal
            lng={annonce.longitude ?? 3.042}
            lat={annonce.latitude ?? 36.752}
            title={annonce.title}
            locationLabel={`${annonce.wilaya.name}${annonce.commune ? `, ${annonce.commune}` : ""}${annonce.address ? ` — ${annonce.address}` : ""}`}
            staticMapUrl={`https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-s+003527(${annonce.longitude ?? 3.042},${annonce.latitude ?? 36.752})/${annonce.longitude ?? 3.042},${annonce.latitude ?? 36.752},13,0/800x400@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
          />
        </div>

        {/* ============ SIDEBAR (1/3) ============ */}
        <aside className="w-full lg:w-1/3">
          <div className="sticky top-28 space-y-6">
            {/* Contact Form Card */}
            <div className="bg-surface-container-lowest p-8 rounded-2xl editorial-shadow border border-outline-variant/10">
              <h3 className="text-2xl font-headline font-extrabold text-primary mb-6 leading-tight">
                Intéressé par ce bien ?
              </h3>
              <ContactForm listingId={annonce.id} />
            </div>

            {/* Agent Profile Card */}
            <div className="bg-surface-container p-6 rounded-2xl flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary/20 bg-primary/10 flex items-center justify-center">
                {annonce.user.image ? (
                  <img
                    src={annonce.user.image}
                    alt={annonce.user.name ?? ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-bold text-2xl">
                    {annonce.user.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-primary font-headline font-bold text-lg leading-tight">
                  {annonce.user.name}
                </div>
                <div className="text-on-surface-variant text-sm font-medium">
                  Annonceur
                </div>
                {annonce.contactPhone && (
                  <a
                    href={`tel:${annonce.contactPhone}`}
                    className="mt-2 inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline underline-offset-4"
                  >
                    <span className="material-symbols-outlined text-base">
                      call
                    </span>
                    {annonce.contactPhone}
                  </a>
                )}
              </div>
            </div>

            {/* Verified badge */}
            <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 flex gap-4">
              <span className="material-symbols-outlined text-primary flex-shrink-0">
                verified_user
              </span>
              <div>
                <p className="text-sm font-bold text-primary uppercase tracking-tight">
                  Annonce Vérifiée
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Cette annonce a été vérifiée par notre équipe pour garantir
                  son authenticité.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
