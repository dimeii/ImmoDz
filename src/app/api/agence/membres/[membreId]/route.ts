import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateMembreRoleSchema } from "@/lib/validations/agence";

type Params = { membreId: string };

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "AGENCY_DIRECTOR") {
      return NextResponse.json(
        { error: "Seul un directeur peut retirer des agents" },
        { status: 403 }
      );
    }

    const { membreId } = await params;

    const membership = await db.agencyMember.findFirst({
      where: { userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Vous n'appartenez à aucune agence" },
        { status: 404 }
      );
    }

    const targetMember = await db.agencyMember.findUnique({
      where: { id: membreId },
    });

    if (!targetMember || targetMember.agencyId !== membership.agencyId) {
      return NextResponse.json(
        { error: "Membre non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que ce n'est pas le dernier AGENCY_DIRECTOR
    if (targetMember.role === "AGENCY_DIRECTOR") {
      const directorCount = await db.agencyMember.count({
        where: {
          agencyId: membership.agencyId,
          role: "AGENCY_DIRECTOR",
        },
      });

      if (directorCount <= 1) {
        return NextResponse.json(
          { error: "Impossible de retirer le dernier directeur de l'agence" },
          { status: 409 }
        );
      }
    }

    // Supprimer et réinitialiser le rôle en transaction
    await db.$transaction(async (tx) => {
      await tx.agencyMember.delete({
        where: { id: membreId },
      });

      await tx.user.update({
        where: { id: targetMember.userId },
        data: { role: "USER" },
      });
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "AGENCY_DIRECTOR") {
      return NextResponse.json(
        { error: "Seul un directeur peut modifier les rôles" },
        { status: 403 }
      );
    }

    const { membreId } = await params;

    const body = await request.json();
    const { role: newRole } = updateMembreRoleSchema.parse(body);

    const membership = await db.agencyMember.findFirst({
      where: { userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Vous n'appartenez à aucune agence" },
        { status: 404 }
      );
    }

    const targetMember = await db.agencyMember.findUnique({
      where: { id: membreId },
    });

    if (!targetMember || targetMember.agencyId !== membership.agencyId) {
      return NextResponse.json(
        { error: "Membre non trouvé" },
        { status: 404 }
      );
    }

    // Si on rétrograde un DIRECTOR, vérifier qu'il en reste au moins un autre
    if (targetMember.role === "AGENCY_DIRECTOR" && newRole !== "AGENCY_DIRECTOR") {
      const directorCount = await db.agencyMember.count({
        where: {
          agencyId: membership.agencyId,
          role: "AGENCY_DIRECTOR",
        },
      });

      if (directorCount <= 1) {
        return NextResponse.json(
          { error: "Impossible de rétrograder le dernier directeur" },
          { status: 409 }
        );
      }
    }

    // Mettre à jour rôle en transaction
    const updated = await db.$transaction(async (tx) => {
      const member = await tx.agencyMember.update({
        where: { id: membreId },
        data: { role: newRole },
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

      await tx.user.update({
        where: { id: targetMember.userId },
        data: { role: newRole },
      });

      return member;
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
