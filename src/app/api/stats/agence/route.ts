import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aggregateListingStats } from "@/lib/stats";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "AGENCY_DIRECTOR" && role !== "ADMIN") {
    return NextResponse.json({ error: "Accès réservé aux directeurs" }, { status: 403 });
  }

  const membership = await db.agencyMember.findFirst({
    where: { userId: session.user.id, role: "AGENCY_DIRECTOR" },
    include: {
      agency: {
        include: { members: { include: { user: { select: { id: true, name: true, image: true } } } } },
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "Aucune agence" }, { status: 404 });
  }

  const days = Math.max(
    1,
    Math.min(365, parseInt(request.nextUrl.searchParams.get("days") ?? "30", 10) || 30)
  );

  const listings = await db.listing.findMany({
    where: { agencyId: membership.agencyId },
    select: { id: true, userId: true, title: true },
  });

  const allStats = await aggregateListingStats(
    listings.map((l) => l.id),
    days
  );

  // Breakdown par agent
  const memberAggregates = new Map<
    string,
    { name: string | null; image: string | null; views: number; contacts: number; listings: number }
  >();
  for (const m of membership.agency.members) {
    memberAggregates.set(m.userId, {
      name: m.user.name,
      image: m.user.image,
      views: 0,
      contacts: 0,
      listings: 0,
    });
  }

  // Compter les annonces par agent
  for (const l of listings) {
    const agg = memberAggregates.get(l.userId);
    if (agg) agg.listings++;
  }

  // Pour chaque membre, calculer les stats sur ses annonces
  const entries = Array.from(memberAggregates.entries());
  for (const [userId, agg] of entries) {
    const userListings = listings.filter((l) => l.userId === userId).map((l) => l.id);
    if (userListings.length === 0) continue;
    const s = await aggregateListingStats(userListings, days);
    agg.views = s.totals.views;
    agg.contacts = s.totals.contacts;
  }

  return NextResponse.json({
    agency: { id: membership.agencyId, name: membership.agency.name },
    stats: allStats,
    members: entries.map(([id, agg]) => ({ userId: id, ...agg })),
  });
}
