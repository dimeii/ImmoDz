"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ListingForm from "@/components/forms/ListingForm";

export default function NouvelleAnnoncePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-primary-950 mb-2">
        Deposer une annonce
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Remplissez les informations ci-dessous pour publier votre annonce.
      </p>
      <ListingForm mode="create" />
    </div>
  );
}
