"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import ListingForm from "@/components/forms/ListingForm";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function EditAnnoncePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: listing, isLoading } = useSWR(`/api/annonces/${id}`, fetcher);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (listing && session?.user?.id) {
      const role = (session.user as { role?: string }).role;
      if (listing.userId !== session.user.id && role !== "ADMIN") {
        router.push(`/annonces/${id}`);
      }
    }
  }, [listing, session, id, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!session || !listing) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-primary-950 mb-2">
        Modifier l&apos;annonce
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Modifiez les informations de votre annonce.
      </p>
      <ListingForm
        mode="edit"
        listing={{
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          transactionType: listing.transactionType,
          propertyType: listing.propertyType,
          wilayaCode: listing.wilayaCode,
          commune: listing.commune,
          address: listing.address,
          surface: listing.surface,
          rooms: listing.rooms,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          floor: listing.floor,
          totalFloors: listing.totalFloors,
          yearBuilt: listing.yearBuilt,
          hasElevator: listing.hasElevator,
          hasParking: listing.hasParking,
          hasGarden: listing.hasGarden,
          hasPool: listing.hasPool,
          isFurnished: listing.isFurnished,
          latitude: listing.latitude,
          longitude: listing.longitude,
        }}
      />
    </div>
  );
}
