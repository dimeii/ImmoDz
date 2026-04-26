import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;

  const thread = await db.thread.findUnique({
    where: { id: params.id },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          price: true,
          transactionType: true,
          photos: { take: 1, orderBy: { order: "asc" }, select: { url: true } },
        },
      },
      initiator: { select: { id: true, name: true, image: true, phone: true } },
      recipient: { select: { id: true, name: true, image: true, phone: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!thread) {
    return NextResponse.json({ error: "Thread introuvable" }, { status: 404 });
  }

  if (thread.initiatorId !== userId && thread.recipientId !== userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const isInitiator = thread.initiatorId === userId;

  return NextResponse.json({
    thread: {
      id: thread.id,
      listing: thread.listing,
      otherUser: isInitiator ? thread.recipient : thread.initiator,
      messages: thread.messages,
      unread: isInitiator ? thread.unreadByInitiator : thread.unreadByRecipient,
    },
  });
}
