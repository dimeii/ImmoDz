import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
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
    select: { id: true, initiatorId: true, recipientId: true },
  });

  if (!thread) {
    return NextResponse.json({ error: "Thread introuvable" }, { status: 404 });
  }

  if (thread.initiatorId !== userId && thread.recipientId !== userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const isInitiator = thread.initiatorId === userId;

  await db.$transaction([
    db.threadMessage.updateMany({
      where: {
        threadId: thread.id,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    }),
    db.thread.update({
      where: { id: thread.id },
      data: isInitiator
        ? { unreadByInitiator: false }
        : { unreadByRecipient: false },
    }),
  ]);

  return NextResponse.json({ success: true });
}
