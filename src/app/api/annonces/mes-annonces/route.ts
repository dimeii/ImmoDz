import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = 10;
    const status = searchParams.get("status") || undefined;
    const propertyType = searchParams.get("propertyType") || undefined;
    const transactionType = searchParams.get("transactionType") || undefined;
    const sort = searchParams.get("sort") || "recent";
    const q = searchParams.get("q") || undefined;

    const where: Record<string, unknown> = { userId: session.user.id };
    if (status) where.status = status;
    if (propertyType) where.propertyType = propertyType;
    if (transactionType) where.transactionType = transactionType;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { commune: { contains: q, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, string> =
      sort === "price_asc"
        ? { price: "asc" }
        : sort === "price_desc"
          ? { price: "desc" }
          : sort === "oldest"
            ? { createdAt: "asc" }
            : { createdAt: "desc" };

    const [annonces, total] = await Promise.all([
      db.listing.findMany({
        where,
        include: {
          wilaya: true,
          photos: { take: 1, orderBy: { order: "asc" } },
        },
        orderBy,
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      db.listing.count({ where }),
    ]);

    const hasMore = annonces.length > limit;
    const items = hasMore ? annonces.slice(0, limit) : annonces;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json({ annonces: items, total, nextCursor });
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
