import FavoriteButton from "@/components/annonces/FavoriteButton";

interface AnnonceCardProps {
  id: string;
  title: string;
  price: number;
  transactionType: "RENT" | "SALE";
  propertyType: string;
  surface?: number | null;
  rooms?: number | null;
  wilaya: string;
  thumbnail?: string | null;
}

export default function AnnonceCard({
  id,
  title,
  price,
  transactionType,
  propertyType,
  surface,
  rooms,
  wilaya,
  thumbnail,
}: AnnonceCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border-l-4 border-l-primary-950 border border-primary-100 bg-white shadow-sm transition-all hover:shadow-lg hover:border-l-primary-900 hover:-translate-y-1">
      <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 to-primary-50 relative">
        {thumbnail && (
          <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
        )}
        <FavoriteButton listingId={id} variant="card" />
        <div className="absolute top-2 right-2 bg-primary-950 text-white px-2 py-1 rounded text-xs font-bold">
          {transactionType === "RENT" ? "Location" : "Vente"}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 hover:underline underline-offset-4 decoration-2">{title}</h3>
        <p className="text-xl font-bold text-primary-950">
          {price.toLocaleString("fr-DZ")} DA
          {transactionType === "RENT" && <span className="text-sm font-normal text-gray-500"> / mois</span>}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600 font-medium">
          <span className="bg-primary-100 text-primary-950 px-2 py-1 rounded font-semibold">{propertyType}</span>
          {surface && <span className="bg-gray-100 px-2 py-1 rounded">{surface} m²</span>}
          {rooms && <span className="bg-gray-100 px-2 py-1 rounded">{rooms} pièces</span>}
        </div>
        <p className="mt-3 text-sm text-primary-950 font-semibold">📍 {wilaya}</p>
      </div>
    </div>
  );
}
