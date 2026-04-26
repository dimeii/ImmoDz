import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRedis } from "@/lib/redis";
import { sendMessageSchema } from "@/lib/validations/thread";
import { RATE_LIMITS } from "@/lib/config";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;
    const rateKey = `msg:send:${userId}`;
    const redis = getRedis();
    let count = 0;
    try {
      count = (await redis.get<number>(rateKey)) ?? 0;
      if (count >= RATE_LIMITS.MESSAGE_SEND_PER_HOUR) {
        return NextResponse.json(
          { error: "Trop de messages. Réessayez dans une heure." },
          { status: 429 }
        );
      }
    } catch (err) {
      console.warn("Redis unavailable, skipping rate limit:", err);
    }

    const body = await request.json();
    const { body: messageBody } = sendMessageSchema.parse(body);

    const thread = await db.thread.findUnique({
      where: { id: params.id },
      select: { id: true, initiatorId: true, recipientId: true, status: true },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread introuvable" }, { status: 404 });
    }

    if (thread.initiatorId !== userId && thread.recipientId !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    if (thread.status === "BLOCKED") {
      return NextResponse.json({ error: "Conversation bloquée" }, { status: 403 });
    }

    const isInitiator = thread.initiatorId === userId;

    const [message] = await db.$transaction([
      db.threadMessage.create({
        data: {
          threadId: thread.id,
          senderId: userId,
          body: messageBody,
        },
      }),
      db.thread.update({
        where: { id: thread.id },
        data: {
          lastMessageAt: new Date(),
          unreadByInitiator: isInitiator ? false : true,
          unreadByRecipient: isInitiator ? true : false,
          status: "ACTIVE",
        },
      }),
    ]);

    try {
      await redis.incr(rateKey);
      if (count === 0) await redis.expire(rateKey, 3600);
    } catch (err) {
      console.warn("Redis incr failed:", err);
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    console.error("Message send error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
