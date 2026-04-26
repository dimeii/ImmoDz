import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const PROPERTY_TYPES = [
  "APARTMENT",
  "HOUSE",
  "VILLA",
  "STUDIO",
  "LAND",
  "COMMERCIAL",
  "OFFICE",
  "GARAGE",
  "OTHER",
] as const;

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  image: z.string().url().or(z.literal("")).optional().nullable(),
  specialtyTypes: z.array(z.enum(PROPERTY_TYPES)).optional(),
  specialtyWilayas: z
    .array(z.coerce.number().int().min(1).max(58))
    .optional(),
  acceptsMessages: z.boolean().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateProfileSchema.parse(body);

    const data: Record<string, unknown> = {};
    if (validated.name !== undefined) data.name = validated.name;
    if (validated.phone !== undefined) data.phone = validated.phone || null;
    if (validated.bio !== undefined) data.bio = validated.bio || null;
    if (validated.image !== undefined) data.image = validated.image || null;
    if (validated.specialtyTypes !== undefined)
      data.specialtyTypes = validated.specialtyTypes;
    if (validated.specialtyWilayas !== undefined)
      data.specialtyWilayas = validated.specialtyWilayas;
    if (validated.acceptsMessages !== undefined)
      data.acceptsMessages = validated.acceptsMessages;

    const updated = await db.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        bio: true,
        specialtyTypes: true,
        specialtyWilayas: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
