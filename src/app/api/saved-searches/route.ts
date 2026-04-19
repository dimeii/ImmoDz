import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSavedSearchSchema } from "@/lib/validations/saved-search";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const searches = await db.savedSearch.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ searches });
  } catch (error) {
    console.error("GET /api/saved-searches error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, filters } = createSavedSearchSchema.parse(body);

    const search = await db.savedSearch.create({
      data: {
        userId: session.user.id,
        name,
        filters,
      },
    });

    return NextResponse.json({ search }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    console.error("POST /api/saved-searches error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
