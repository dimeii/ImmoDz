"use client";

interface MapPinProps {
  price: number;
  transactionType: "RENT" | "SALE";
}

export default function MapPin({ price, transactionType }: MapPinProps) {
  return (
    <div className="rounded-full bg-primary-600 px-2 py-1 text-xs font-semibold text-white shadow-md">
      {price.toLocaleString("fr-DZ")} {transactionType === "RENT" ? "DA/mois" : "DA"}
    </div>
  );
}
