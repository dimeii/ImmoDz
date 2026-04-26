import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRedis } from "@/lib/redis";
import { reportListingSchema } from "@/lib/validations/report";

const RATE_LIMIT_PER_HOUR = 5;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour signaler une annonce." },
        { status: 401 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rateKey = `report:${session.user.id}`;
    const redis = getRedis();
    let count = 0;
    try {
      count = (await redis.get<number>(rateKey)) ?? 0;
      if (count >= RATE_LIMIT_PER_HOUR) {
        return NextResponse.json(
          { error: "Trop de signalements. Réessayez plus tard." },
          { status: 429 }
        );
      }
    } catch (err) {
      console.warn("Redis unavailable, skipping rate limit:", err);
    }

    const body = await request.json();
    const { reason, comment } = reportListingSchema.parse(body);

    const listing = await db.listing.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true, title: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    }

    if (listing.userId === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas signaler votre propre annonce." },
        { status: 400 }
      );
    }

    // Empêche un même user de signaler 2× la même annonce avec un signalement encore PENDING
    const existing = await db.listingReport.findFirst({
      where: {
        listingId: params.id,
        reporterId: session.user.id,
        status: "PENDING",
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Vous avez déjà signalé cette annonce. Un admin la traite." },
        { status: 409 }
      );
    }

    await db.listingReport.create({
      data: {
        listingId: params.id,
        reporterId: session.user.id,
        reporterIp: ip,
        reason,
        comment: comment || null,
      },
    });

    try {
      await redis.incr(rateKey);
      if (count === 0) await redis.expire(rateKey, 3600);
    } catch (err) {
      console.warn("Redis incr failed:", err);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    console.error("Report error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
