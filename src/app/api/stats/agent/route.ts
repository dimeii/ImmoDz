import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aggregateListingStats } from "@/lib/stats";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const days = Math.max(
    1,
    Math.min(365, parseInt(request.nextUrl.searchParams.get("days") ?? "30", 10) || 30)
  );

  const listings = await db.listing.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const stats = await aggregateListingStats(
    listings.map((l) => l.id),
    days
  );

  return NextResponse.json(stats);
}
