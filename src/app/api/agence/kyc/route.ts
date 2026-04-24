import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const submitSchema = z.object({
  documentUrl: z.string().url(),
  documentPublicId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const membership = await db.agencyMember.findFirst({
      where: { userId: session.user.id },
      select: { agencyId: true, role: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Vous n'appartenez à aucune agence" },
        { status: 404 }
      );
    }

    if (membership.role !== "AGENCY_DIRECTOR") {
      return NextResponse.json(
        { error: "Seul un directeur peut soumettre le KYC" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { documentUrl, documentPublicId } = submitSchema.parse(body);

    const current = await db.agency.findUnique({
      where: { id: membership.agencyId },
      select: { kycStatus: true },
    });

    if (current?.kycStatus === "VERIFIED") {
      return NextResponse.json(
        { error: "Agence déjà vérifiée" },
        { status: 409 }
      );
    }

    if (current?.kycStatus === "PENDING") {
      return NextResponse.json(
        { error: "Un document est déjà en cours de vérification" },
        { status: 409 }
      );
    }

    const updated = await db.agency.update({
      where: { id: membership.agencyId },
      data: {
        kycStatus: "PENDING",
        kycDocumentUrl: documentUrl,
        kycDocumentPublicId: documentPublicId,
        kycSubmittedAt: new Date(),
        kycReviewedAt: null,
        kycReviewedBy: null,
        kycRejectionReason: null,
      },
      select: { id: true, kycStatus: true },
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
