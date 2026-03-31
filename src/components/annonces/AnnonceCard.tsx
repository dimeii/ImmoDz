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
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-[4/3] bg-gray-200">
        {thumbnail && (
          <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{title}</h3>
        <p className="mt-1 text-lg font-bold text-primary-600">
          {price.toLocaleString("fr-DZ")} DA
          {transactionType === "RENT" && <span className="text-sm font-normal">/mois</span>}
        </p>
        <div className="mt-2 flex gap-3 text-sm text-gray-500">
          <span>{propertyType}</span>
          {surface && <span>{surface} m²</span>}
          {rooms && <span>{rooms} pièces</span>}
        </div>
        <p className="mt-1 text-sm text-gray-400">{wilaya}</p>
      </div>
    </div>
  );
}
