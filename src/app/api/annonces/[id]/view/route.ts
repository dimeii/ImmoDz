import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const referrer = request.headers.get("referer");
    await db.$transaction([
      db.listing.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } },
      }),
      db.listingView.create({
        data: {
          listingId: params.id,
          referrer: referrer && referrer.length < 500 ? referrer : null,
        },
      }),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
}
