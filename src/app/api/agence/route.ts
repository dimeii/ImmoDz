import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateAgenceSchema } from "@/lib/validations/agence";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const membership = await db.agencyMember.findFirst({
      where: { userId: session.user.id },
      include: {
        agency: {
          include: { wilaya: true },
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Vous n'appartenez à aucune agence" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      agency: membership.agency,
      memberRole: membership.role,
    });
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const membership = await db.agencyMember.findFirst({
      where: { userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Vous n'appartenez à aucune agence" },
        { status: 404 }
      );
    }

    if (membership.role !== "AGENCY_DIRECTOR") {
      return NextResponse.json(
        { error: "Seul un directeur peut modifier l'agence" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = updateAgenceSchema.parse(body);

    const updated = await db.agency.update({
      where: { id: membership.agencyId },
      data: validated,
      include: { wilaya: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
