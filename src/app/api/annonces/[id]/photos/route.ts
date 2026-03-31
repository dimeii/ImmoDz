import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { LIMITS } from "@/lib/config";

const addPhotoSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  category: z
    .enum(["LIVING_ROOM", "BEDROOM", "KITCHEN", "BATHROOM", "EXTERIOR", "OTHER"])
    .default("OTHER"),
  order: z.number().int().nonnegative().default(0),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const listing = await db.listing.findUnique({
      where: { id: params.id },
      include: { _count: { select: { photos: true } } },
    });

    if (!listing) {
      return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    }

    const role = (session.user as { role?: string }).role ?? "USER";
    if (listing.userId !== session.user.id && role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Vérifier la limite de photos
    const maxPhotos =
      role === "USER" ? LIMITS.USER_MAX_PHOTOS : LIMITS.AGENCY_MAX_PHOTOS;
    if (listing._count.photos >= maxPhotos) {
      return NextResponse.json(
        { error: `Limite de ${maxPhotos} photos atteinte` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = addPhotoSchema.parse(body);

    const photo = await db.listingPhoto.create({
      data: {
        listingId: params.id,
        ...validated,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
