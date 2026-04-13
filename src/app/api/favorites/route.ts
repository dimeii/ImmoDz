import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ids: [] });
  }

  const favorites = await db.favorite.findMany({
    where: { userId: session.user.id },
    select: { listingId: true },
  });

  return NextResponse.json({ ids: favorites.map((f) => f.listingId) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { listingId } = await req.json();
  if (!listingId || typeof listingId !== "string") {
    return NextResponse.json({ error: "listingId requis" }, { status: 400 });
  }

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { id: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  }

  try {
    await db.favorite.create({
      data: { userId: session.user.id, listingId },
    });
  } catch {
    /* déjà favori, ignore */
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { listingId } = await req.json();
  if (!listingId || typeof listingId !== "string") {
    return NextResponse.json({ error: "listingId requis" }, { status: 400 });
  }

  await db.favorite.deleteMany({
    where: { userId: session.user.id, listingId },
  });

  return NextResponse.json({ ok: true });
}
