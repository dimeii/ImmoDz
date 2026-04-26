import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRedis } from "@/lib/redis";
import { createThreadSchema } from "@/lib/validations/thread";
import { RATE_LIMITS } from "@/lib/config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;

  const threads = await db.thread.findMany({
    where: {
      OR: [{ initiatorId: userId }, { recipientId: userId }],
      status: "ACTIVE",
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          photos: { take: 1, orderBy: { order: "asc" }, select: { url: true } },
        },
      },
      initiator: { select: { id: true, name: true, image: true } },
      recipient: { select: { id: true, name: true, image: true, phone: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true, senderId: true },
      },
    },
    orderBy: { lastMessageAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    threads: threads.map((t) => {
      const isInitiator = t.initiatorId === userId;
      return {
        id: t.id,
        listingId: t.listingId,
        listingTitle: t.listing?.title ?? null,
        listingThumb: t.listing?.photos[0]?.url ?? null,
        otherUser: isInitiator ? t.recipient : t.initiator,
        unread: isInitiator ? t.unreadByInitiator : t.unreadByRecipient,
        lastMessage: t.messages[0] ?? null,
        lastMessageAt: t.lastMessageAt,
      };
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rateKey = `thread:create:${ip}`;
    const redis = getRedis();
    let count = 0;
    try {
      count = (await redis.get<number>(rateKey)) ?? 0;
      if (count >= RATE_LIMITS.THREAD_CREATE_PER_HOUR) {
        return NextResponse.json(
          { error: "Trop de nouveaux contacts. Réessayez dans une heure." },
          { status: 429 }
        );
      }
    } catch (err) {
      console.warn("Redis unavailable, skipping rate limit:", err);
    }

    const body = await request.json();
    const { listingId, body: messageBody } = createThreadSchema.parse(body);

    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { id: true, userId: true, status: true, title: true },
    });

    if (!listing || listing.status !== "ACTIVE") {
      return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    }

    if (listing.userId === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous contacter vous-même" },
        { status: 400 }
      );
    }

    const initiatorId = session.user.id;
    const recipientId = listing.userId;

    // findFirst + create/update au lieu d'upsert : le compound unique sur listingId
    // (nullable) ne génère pas un accesseur fiable côté Prisma client.
    const existing = await db.thread.findFirst({
      where: { listingId, initiatorId, recipientId },
      select: { id: true },
    });

    const thread = existing
      ? await db.thread.update({
          where: { id: existing.id },
          data: {
            lastMessageAt: new Date(),
            unreadByRecipient: true,
            status: "ACTIVE",
          },
        })
      : await db.thread.create({
          data: {
            listingId,
            initiatorId,
            recipientId,
            lastMessageAt: new Date(),
            unreadByRecipient: true,
          },
        });

    await db.$transaction([
      db.threadMessage.create({
        data: {
          threadId: thread.id,
          senderId: initiatorId,
          body: messageBody,
        },
      }),
      db.listing.update({
        where: { id: listingId },
        data: { contactCount: { increment: 1 } },
      }),
    ]);

    try {
      await redis.incr(rateKey);
      if (count === 0) await redis.expire(rateKey, 3600);
    } catch (err) {
      console.warn("Redis incr failed:", err);
    }

    return NextResponse.json({ threadId: thread.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    console.error("Thread create error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
