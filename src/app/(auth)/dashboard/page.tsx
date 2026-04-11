import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import DashboardListings from "@/components/dashboard/DashboardListings";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  const membership = await db.agencyMember.findFirst({
    where: { userId: session.user.id },
    include: { agency: true },
  });

  const initialLimit = 10;
  const listings = await db.listing.findMany({
    where: { userId: session.user.id },
    include: {
      wilaya: true,
      photos: { take: 1, orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: initialLimit + 1,
  });

  const hasMore = listings.length > initialLimit;
  const initialListings = hasMore ? listings.slice(0, initialLimit) : listings;
  const initialCursor = hasMore ? initialListings[initialListings.length - 1].id : null;

  const listingStats = await db.listing.count({
    where: { userId: session.user.id, status: "ACTIVE" },
  });

  const totalListings = await db.listing.count({
    where: { userId: session.user.id },
  });

  const isAgencyMember = membership?.role === "AGENCY_DIRECTOR" || membership?.role === "AGENCY_EMPLOYEE";

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900">
            Bienvenue, {user?.name || "utilisateur"} 👋
          </h1>
          <p className="text-gray-500 mt-2">Gérez vos annonces et votre agence</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Annonces actives
              </h3>
              <svg className="h-5 w-5 text-primary-950" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-14.032a22.373 22.373 0 00-6.006 0C8.09 3.394 7 4.587 7 5.942v12.116c0 1.355 1.09 2.548 2.497 2.724a22.373 22.373 0 006.006 0C16.91 20.606 18 19.413 18 18.058V5.942c0-1.355-1.09-2.548-2.497-2.724z" />
              </svg>
            </div>
            <div className="text-3xl font-black text-gray-900">{listingStats}</div>
          </div>

          {isAgencyMember && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Agence
                </h3>
                <svg className="h-5 w-5 text-primary-950" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <div className="text-lg font-bold text-gray-900 mb-3">
                {membership?.agency.name}
              </div>
              <Link
                href="/agence"
                className="text-sm font-semibold text-primary-950 hover:text-primary-900"
              >
                Gérer l'agence →
              </Link>
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <Link
            href="/annonces/nouvelle"
            className="rounded-2xl border-2 border-primary-950 bg-primary-950 text-white px-6 py-4 font-bold hover:bg-primary-900 transition-all"
          >
            ➕ Nouvelle annonce
          </Link>
          <Link
            href={`/recherche?userId=${session.user.id}${user?.name ? `&agentName=${encodeURIComponent(user.name)}` : ""}`}
            className="rounded-2xl border-2 border-gray-200 bg-white text-primary-950 px-6 py-4 font-bold hover:border-primary-950 transition-all"
          >
            🗺️ Consulter mes annonces sur la carte
          </Link>
        </div>

        {/* Annonces */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Vos annonces
          </h2>

          {totalListings === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
              <p className="text-gray-500 mb-4">
                Vous n'avez encore aucune annonce
              </p>
              <Link
                href="/annonces/nouvelle"
                className="inline-flex items-center gap-2 bg-primary-950 text-white font-bold px-6 py-3 rounded-lg hover:bg-primary-900 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Créer votre première annonce
              </Link>
            </div>
          ) : (
            <DashboardListings
              initialListings={JSON.parse(JSON.stringify(initialListings))}
              initialTotal={totalListings}
              initialCursor={initialCursor}
            />
          )}
        </div>
      </div>
    </main>
  );
}
