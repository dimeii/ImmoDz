import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviewReportSchema } from "@/lib/validations/report";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Réservé aux admins" }, { status: 403 });
  }

  const reports = await db.listingReport.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          status: true,
          photos: { take: 1, orderBy: { order: "asc" }, select: { url: true } },
        },
      },
      reporter: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ reports });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role !== "ADMIN" || !session?.user?.id) {
      return NextResponse.json({ error: "Réservé aux admins" }, { status: 403 });
    }

    const body = await request.json();
    const { reportId, action, rejectListing, rejectionReason } =
      reviewReportSchema.parse(body);

    const report = await db.listingReport.findUnique({
      where: { id: reportId },
      include: { listing: { select: { id: true } } },
    });

    if (!report) {
      return NextResponse.json({ error: "Signalement introuvable" }, { status: 404 });
    }

    if (action === "REVIEWED" && rejectListing) {
      if (!rejectionReason || rejectionReason.trim().length < 3) {
        return NextResponse.json(
          { error: "Motif de rejet requis (min 3 caractères)." },
          { status: 400 }
        );
      }
      await db.$transaction([
        db.listing.update({
          where: { id: report.listingId },
          data: {
            status: "REJECTED",
            rejectionReason,
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
          },
        }),
        db.listingReport.update({
          where: { id: reportId },
          data: {
            status: "REVIEWED",
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
          },
        }),
        // Auto-clore les autres signalements PENDING de la même annonce
        db.listingReport.updateMany({
          where: {
            listingId: report.listingId,
            status: "PENDING",
            id: { not: reportId },
          },
          data: {
            status: "REVIEWED",
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
          },
        }),
      ]);
    } else {
      await db.listingReport.update({
        where: { id: reportId },
        data: {
          status: action,
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    console.error("Review report error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
