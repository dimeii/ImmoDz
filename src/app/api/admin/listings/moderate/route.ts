import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const moderateSchema = z.discriminatedUnion("action", [
  z.object({
    id: z.string().min(1),
    action: z.literal("approve"),
  }),
  z.object({
    id: z.string().min(1),
    action: z.literal("reject"),
    reason: z.string().min(3).max(1000),
  }),
]);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user?.id || role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = moderateSchema.parse(body);

    const listing = await db.listing.findUnique({
      where: { id: parsed.id },
      select: { id: true, status: true },
    });
    if (!listing) {
      return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    }

    const now = new Date();
    const updated =
      parsed.action === "approve"
        ? await db.listing.update({
            where: { id: parsed.id },
            data: {
              status: "ACTIVE",
              rejectionReason: null,
              reviewedAt: now,
              reviewedBy: session.user.id,
            },
          })
        : await db.listing.update({
            where: { id: parsed.id },
            data: {
              status: "REJECTED",
              rejectionReason: parsed.reason,
              reviewedAt: now,
              reviewedBy: session.user.id,
            },
          });

    return NextResponse.json({ id: updated.id, status: updated.status });
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
