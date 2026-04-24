import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getResend } from "@/lib/resend";
import {
  filtersToListingWhere,
  describeFilters,
} from "@/lib/saved-search";
import {
  savedSearchFiltersSchema,
  type SavedSearchFilters,
} from "@/lib/validations/saved-search";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

function renderEmail(
  userName: string | null,
  searchName: string,
  filtersSummary: string,
  matches: Array<{
    id: string;
    title: string;
    price: number;
    wilaya: string;
    thumbnail: string | null;
  }>,
  baseUrl: string
): string {
  const rows = matches
    .map(
      (m) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;">
          <a href="${baseUrl}/annonces/${m.id}" style="color:#003527;text-decoration:none;">
            <strong style="font-size:16px;">${m.title}</strong><br/>
            <span style="color:#666;font-size:14px;">${m.wilaya} — ${m.price.toLocaleString("fr-DZ")} DA</span>
          </a>
        </td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2 style="color:#003527;">Bonjour ${userName ?? ""},</h2>
      <p style="color:#333;">
        ${matches.length} nouvelle${matches.length > 1 ? "s" : ""} annonce${matches.length > 1 ? "s" : ""} correspond${matches.length > 1 ? "ent" : ""} à votre alerte
        <strong>« ${searchName} »</strong> (${filtersSummary}) :
      </p>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
      <p style="margin-top:24px;">
        <a href="${baseUrl}/dashboard/alertes" style="color:#003527;">
          Gérer mes alertes
        </a>
      </p>
    </div>
  `;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://immodz.com";
  const searches = await db.savedSearch.findMany({
    include: { user: { select: { email: true, name: true } } },
  });

  let emailsSent = 0;
  let searchesProcessed = 0;

  for (const search of searches) {
    searchesProcessed++;
    const parsed = savedSearchFiltersSchema.safeParse(search.filters);
    if (!parsed.success) continue;
    const filters: SavedSearchFilters = parsed.data;

    const where = filtersToListingWhere(filters);
    where.createdAt = { gt: search.lastNotifiedAt };

    const matches = await db.listing.findMany({
      where,
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        price: true,
        wilaya: { select: { name: true } },
        photos: { take: 1, orderBy: { order: "asc" }, select: { url: true } },
      },
    });

    if (matches.length === 0) continue;
    if (!search.user.email) continue;

    try {
      await getResend().emails.send({
        from: "ImmoDz <noreply@immodz.com>",
        to: search.user.email,
        subject: `${matches.length} nouvelle${matches.length > 1 ? "s" : ""} annonce${matches.length > 1 ? "s" : ""} — ${search.name}`,
        html: renderEmail(
          search.user.name,
          search.name,
          describeFilters(filters),
          matches.map((m) => ({
            id: m.id,
            title: m.title,
            price: m.price,
            wilaya: m.wilaya.name,
            thumbnail: m.photos[0]?.url ?? null,
          })),
          baseUrl
        ),
      });
      emailsSent++;
    } catch (err) {
      console.error("Email send failed for search", search.id, err);
      continue;
    }

    await db.savedSearch.update({
      where: { id: search.id },
      data: { lastNotifiedAt: new Date() },
    });
  }

  return NextResponse.json({
    processed: searchesProcessed,
    emailsSent,
  });
}
