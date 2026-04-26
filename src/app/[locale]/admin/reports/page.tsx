import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import ReportsQueue from "@/components/admin/ReportsQueue";

export default async function AdminReportsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id) redirect("/login");
  if (role !== "ADMIN") redirect("/");

  const reports = await db.listingReport.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          status: true,
          photos: { take: 1, orderBy: { order: "asc" }, select: { url: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      },
      reporter: { select: { id: true, name: true, email: true } },
    },
  });

  // Grouper par listing pour afficher les multiples signalements
  const byListing = new Map<string, typeof reports>();
  for (const r of reports) {
    const arr = byListing.get(r.listingId) ?? [];
    arr.push(r);
    byListing.set(r.listingId, arr);
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Signalements</h1>
            <p className="text-gray-500 mt-1">
              {reports.length} signalement{reports.length > 1 ? "s" : ""} sur {byListing.size} annonce
              {byListing.size > 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-primary-950 hover:underline">
            ← Retour au back-office
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
            <p className="text-gray-500">Aucun signalement en attente. 🎉</p>
          </div>
        ) : (
          <ReportsQueue
            groups={Array.from(byListing.entries()).map(([listingId, items]) => ({
              listingId,
              listing: items[0].listing,
              reports: items.map((r) => ({
                id: r.id,
                reason: r.reason,
                comment: r.comment,
                createdAt: r.createdAt.toISOString(),
                reporter: r.reporter,
              })),
            }))}
          />
        )}
      </div>
    </main>
  );
}
