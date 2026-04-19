import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import SavedSearchList from "@/components/dashboard/SavedSearchList";

export default async function AlertesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const searches = await db.savedSearch.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const serialized = searches.map((s) => ({
    id: s.id,
    name: s.name,
    filters: s.filters as Record<string, unknown>,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900">Mes alertes</h1>
            <p className="text-gray-500 mt-2">
              Recevez un email quand de nouvelles annonces correspondent
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-primary-950 hover:underline"
          >
            ← Retour au dashboard
          </Link>
        </div>

        <SavedSearchList initialSearches={serialized} />
      </div>
    </main>
  );
}
