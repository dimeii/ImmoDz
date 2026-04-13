import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().max(20).optional().nullable(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone } = updateProfileSchema.parse(body);

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: { name, phone: phone ?? null },
      select: { id: true, name: true, email: true, phone: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
