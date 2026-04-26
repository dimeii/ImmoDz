import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aggregateListingStats } from "@/lib/stats";
import StatsView from "@/components/stats/StatsView";

export default async function AgenceStatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (role !== "AGENCY_DIRECTOR" && role !== "ADMIN") redirect("/");

  const membership = await db.agencyMember.findFirst({
    where: { userId: session.user.id, role: "AGENCY_DIRECTOR" },
    include: {
      agency: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, image: true } } },
          },
        },
      },
    },
  });

  if (!membership) redirect("/agence");

  const listings = await db.listing.findMany({
    where: { agencyId: membership.agencyId },
    select: { id: true, userId: true },
  });

  const stats = await aggregateListingStats(
    listings.map((l) => l.id),
    30
  );

  // Breakdown par agent (vues + contacts sur 30j + nb annonces)
  const memberStats = await Promise.all(
    membership.agency.members.map(async (m) => {
      const ids = listings.filter((l) => l.userId === m.userId).map((l) => l.id);
      const s = ids.length === 0
        ? { totals: { views: 0, contacts: 0 } }
        : await aggregateListingStats(ids, 30);
      return {
        userId: m.userId,
        name: m.user.name,
        image: m.user.image,
        listingCount: ids.length,
        views: s.totals.views,
        contacts: s.totals.contacts,
      };
    })
  );
  memberStats.sort((a, b) => b.views - a.views);

  return (
    <>
      <StatsView
        stats={stats}
        title={membership.agency.name}
        subtitle={`Statistiques agence • ${listings.length} annonce${listings.length > 1 ? "s" : ""} • 30 derniers jours`}
      />

      {/* Breakdown par agent */}
      <div className="max-w-6xl mx-auto px-4 pb-12 -mt-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Performance par agent</h2>
          {memberStats.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun agent dans cette agence.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {memberStats.map((m) => (
                <li key={m.userId} className="py-3 flex items-center gap-4">
                  {m.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.image}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" />
                  )}
                  <Link
                    href={`/agents/${m.userId}`}
                    className="flex-1 min-w-0 font-semibold text-gray-900 hover:text-primary-950 truncate"
                  >
                    {m.name ?? "Agent"}
                  </Link>
                  <div className="flex items-center gap-6 text-sm flex-shrink-0">
                    <span className="text-gray-700">
                      <strong>{m.listingCount}</strong>{" "}
                      <span className="text-xs text-gray-400">annonces</span>
                    </span>
                    <span className="text-gray-700">
                      <strong>{m.views}</strong>{" "}
                      <span className="text-xs text-gray-400">vues</span>
                    </span>
                    <span className="text-gray-700">
                      <strong>{m.contacts}</strong>{" "}
                      <span className="text-xs text-gray-400">contacts</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
