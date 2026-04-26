import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const userId = session.user.id;

  const count = await db.thread.count({
    where: {
      status: "ACTIVE",
      OR: [
        { initiatorId: userId, unreadByInitiator: true },
        { recipientId: userId, unreadByRecipient: true },
      ],
    },
  });

  return NextResponse.json({ count });
}
