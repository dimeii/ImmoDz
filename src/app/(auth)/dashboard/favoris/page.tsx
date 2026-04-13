import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import AnnonceCard from "@/components/annonces/AnnonceCard";

export default async function FavorisPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const favorites = await db.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: {
          wilaya: true,
          photos: { take: 1, orderBy: { order: "asc" } },
        },
      },
    },
  });

  const activeFavorites = favorites.filter(
    (f) => f.listing.status === "ACTIVE"
  );

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900">Mes favoris</h1>
            <p className="text-gray-500 mt-2">
              {activeFavorites.length} annonce
              {activeFavorites.length > 1 ? "s" : ""} enregistrée
              {activeFavorites.length > 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-primary-950 hover:underline"
          >
            ← Retour au dashboard
          </Link>
        </div>

        {activeFavorites.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300">
              favorite
            </span>
            <p className="text-gray-500 mt-4 mb-6">
              Vous n'avez encore aucune annonce en favori
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary-950 text-white font-bold px-6 py-3 rounded-lg hover:bg-primary-900 transition-colors"
            >
              Parcourir les annonces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeFavorites.map((f) => (
              <Link key={f.id} href={`/annonces/${f.listing.id}`}>
                <AnnonceCard
                  id={f.listing.id}
                  title={f.listing.title}
                  price={f.listing.price}
                  transactionType={f.listing.transactionType}
                  propertyType={f.listing.propertyType}
                  surface={f.listing.surface}
                  rooms={f.listing.rooms}
                  wilaya={f.listing.wilaya.name}
                  thumbnail={f.listing.photos[0]?.url}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
