import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inviterMembreSchema } from "@/lib/validations/agence";

export async function GET(request: NextRequest) {
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

    const membres = await db.agencyMember.findMany({
      where: { agencyId: membership.agencyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    return NextResponse.json(membres);
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "AGENCY_DIRECTOR") {
      return NextResponse.json(
        { error: "Seul un directeur peut inviter des agents" },
        { status: 403 }
      );
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

    const body = await request.json();
    const { email } = inviterMembreSchema.parse(body);

    // Chercher l'utilisateur
    const targetUser = await db.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Aucun utilisateur avec cet email" },
        { status: 404 }
      );
    }

    // Vérifier qu'il n'appartient pas déjà à une agence
    const existingMembership = await db.agencyMember.findFirst({
      where: { userId: targetUser.id },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "Cet utilisateur appartient déjà à une agence" },
        { status: 409 }
      );
    }

    // Créer le membership et mettre à jour le rôle dans une transaction
    const newMembership = await db.$transaction(async (tx) => {
      const member = await tx.agencyMember.create({
        data: {
          userId: targetUser.id,
          agencyId: membership.agencyId,
          role: "AGENCY_EMPLOYEE",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
        },
      });

      // Mettre à jour le rôle de l'utilisateur
      await tx.user.update({
        where: { id: targetUser.id },
        data: { role: "AGENCY_EMPLOYEE" },
      });

      return member;
    });

    return NextResponse.json(newMembership, { status: 201 });
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
