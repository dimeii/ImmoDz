import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aggregateListingStats } from "@/lib/stats";
import StatsView from "@/components/stats/StatsView";

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const listings = await db.listing.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const stats = await aggregateListingStats(
    listings.map((l) => l.id),
    30
  );

  return (
    <StatsView
      stats={stats}
      title="Statistiques"
      subtitle={`${listings.length} annonce${listings.length > 1 ? "s" : ""} publiée${listings.length > 1 ? "s" : ""} • Vues et contacts sur 30 jours`}
    />
  );
}
