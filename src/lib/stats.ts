import { db } from "@/lib/db";

export type DailyPoint = { date: string; views: number; contacts: number };

export type ListingStats = {
  range: { from: Date; to: Date; days: number };
  totals: { views: number; contacts: number; viewsAllTime: number; contactsAllTime: number };
  series: DailyPoint[];
  topListings: Array<{
    id: string;
    title: string;
    views: number;
    contacts: number;
    thumbnail: string | null;
  }>;
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Agrège les stats (vues + contacts) sur N jours pour un ensemble d'annonces.
 * Source des vues : table ListingView (append-only depuis 2026-04-26).
 * Source des contacts : Thread.createdAt (messagerie).
 */
export async function aggregateListingStats(
  listingIds: string[],
  days = 30
): Promise<ListingStats> {
  const to = new Date();
  const from = startOfDay(new Date(to.getTime() - (days - 1) * 86_400_000));

  if (listingIds.length === 0) {
    return {
      range: { from, to, days },
      totals: { views: 0, contacts: 0, viewsAllTime: 0, contactsAllTime: 0 },
      series: buildEmptySeries(from, days),
      topListings: [],
    };
  }

  const [views, contacts, viewsAllTime, contactsAllTime, listings] = await Promise.all([
    db.listingView.findMany({
      where: { listingId: { in: listingIds }, viewedAt: { gte: from } },
      select: { listingId: true, viewedAt: true },
    }),
    db.thread.findMany({
      where: { listingId: { in: listingIds }, createdAt: { gte: from } },
      select: { listingId: true, createdAt: true },
    }),
    db.listingView.count({ where: { listingId: { in: listingIds } } }),
    db.thread.count({ where: { listingId: { in: listingIds } } }),
    db.listing.findMany({
      where: { id: { in: listingIds } },
      select: {
        id: true,
        title: true,
        photos: { take: 1, orderBy: { order: "asc" }, select: { url: true } },
      },
    }),
  ]);

  const seriesMap = new Map<string, DailyPoint>();
  for (const p of buildEmptySeries(from, days)) seriesMap.set(p.date, p);

  for (const v of views) {
    const k = dateKey(v.viewedAt);
    const p = seriesMap.get(k);
    if (p) p.views++;
  }
  for (const c of contacts) {
    const k = dateKey(c.createdAt);
    const p = seriesMap.get(k);
    if (p) p.contacts++;
  }

  const series = Array.from(seriesMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const totals = {
    views: views.length,
    contacts: contacts.length,
    viewsAllTime,
    contactsAllTime,
  };

  // Top 5 annonces sur la période
  const perListing = new Map<string, { views: number; contacts: number }>();
  for (const id of listingIds) perListing.set(id, { views: 0, contacts: 0 });
  for (const v of views) perListing.get(v.listingId)!.views++;
  for (const c of contacts) {
    if (c.listingId) perListing.get(c.listingId)!.contacts++;
  }

  const titles = new Map(listings.map((l) => [l.id, l]));
  const topListings = Array.from(perListing.entries())
    .map(([id, agg]) => {
      const l = titles.get(id);
      return {
        id,
        title: l?.title ?? "(annonce supprimée)",
        thumbnail: l?.photos[0]?.url ?? null,
        views: agg.views,
        contacts: agg.contacts,
      };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return { range: { from, to, days }, totals, series, topListings };
}

function buildEmptySeries(from: Date, days: number): DailyPoint[] {
  const out: DailyPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getTime() + i * 86_400_000);
    out.push({ date: dateKey(d), views: 0, contacts: 0 });
  }
  return out;
}
