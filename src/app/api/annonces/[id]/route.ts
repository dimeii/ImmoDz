import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createListingSchema } from "@/lib/validations/listing";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const annonce = await db.listing.findUnique({
      where: { id: params.id },
      include: {
        wilaya: true,
        photos: { orderBy: { order: "asc" } },
        user: { select: { id: true, name: true, image: true } },
      },
    });

    if (!annonce) {
      return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    }

    return NextResponse.json(annonce);
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const annonce = await db.listing.findUnique({ where: { id: params.id } });
    if (!annonce) {
      return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    }

    const role = (session.user as { role?: string }).role;
    if (annonce.userId !== session.user.id && role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const validated = createListingSchema.partial().parse(body);
    const { lat, lng, ...listingData } = validated;

    const updated = await db.listing.update({
      where: { id: params.id },
      data: {
        ...listingData,
        latitude: lat,
        longitude: lng,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const annonce = await db.listing.findUnique({ where: { id: params.id } });
    if (!annonce) {
      return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    }

    const role = (session.user as { role?: string }).role;
    if (annonce.userId !== session.user.id && role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await db.listing.update({
      where: { id: params.id },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
