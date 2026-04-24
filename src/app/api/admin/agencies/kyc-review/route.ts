import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getResend } from "@/lib/resend";

const reviewSchema = z.discriminatedUnion("action", [
  z.object({
    agencyId: z.string().min(1),
    action: z.literal("approve"),
  }),
  z.object({
    agencyId: z.string().min(1),
    action: z.literal("reject"),
    reason: z.string().min(3).max(1000),
  }),
]);

function baseUrl() {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "https://immodz.com";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user?.id || role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = reviewSchema.parse(body);

    const agency = await db.agency.findUnique({
      where: { id: parsed.agencyId },
      select: {
        id: true,
        name: true,
        kycStatus: true,
        members: {
          where: { role: "AGENCY_DIRECTOR" },
          select: { user: { select: { email: true, name: true } } },
          take: 1,
        },
      },
    });
    if (!agency) {
      return NextResponse.json({ error: "Agence introuvable" }, { status: 404 });
    }

    if (agency.kycStatus !== "PENDING") {
      return NextResponse.json(
        { error: "Cette agence n'a pas de KYC en attente" },
        { status: 409 }
      );
    }

    const now = new Date();
    const updated =
      parsed.action === "approve"
        ? await db.agency.update({
            where: { id: parsed.agencyId },
            data: {
              kycStatus: "VERIFIED",
              kycReviewedAt: now,
              kycReviewedBy: session.user.id,
              kycRejectionReason: null,
            },
            select: { id: true, kycStatus: true },
          })
        : await db.agency.update({
            where: { id: parsed.agencyId },
            data: {
              kycStatus: "REJECTED",
              kycReviewedAt: now,
              kycReviewedBy: session.user.id,
              kycRejectionReason: parsed.reason,
            },
            select: { id: true, kycStatus: true },
          });

    // Notif email au directeur — best-effort
    const director = agency.members[0]?.user;
    if (director?.email && process.env.RESEND_API_KEY) {
      const safeName = escapeHtml(agency.name);
      const greeting = director.name
        ? `Bonjour ${escapeHtml(director.name)},`
        : "Bonjour,";
      const agenceUrl = `${baseUrl()}/agence`;

      try {
        if (parsed.action === "approve") {
          await getResend().emails.send({
            from: "ImmoDz <noreply@immodz.com>",
            to: director.email,
            subject: `Votre agence "${agency.name}" est vérifiée`,
            html: `
              <p>${greeting}</p>
              <p>Bonne nouvelle : votre agence <strong>${safeName}</strong> vient d'être vérifiée par notre équipe. Le badge <strong>"Vérifié"</strong> est désormais affiché sur votre fiche publique et sur toutes vos annonces.</p>
              <p><a href="${agenceUrl}" style="display:inline-block;background:#064e3b;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Accéder à mon agence</a></p>
              <p style="color:#666;font-size:13px">— L'équipe ImmoDz</p>
            `,
          });
        } else {
          const safeReason = escapeHtml(parsed.reason);
          await getResend().emails.send({
            from: "ImmoDz <noreply@immodz.com>",
            to: director.email,
            subject: `Vérification de l'agence "${agency.name}" refusée`,
            html: `
              <p>${greeting}</p>
              <p>La vérification de votre agence <strong>${safeName}</strong> n'a pas été validée par notre équipe.</p>
              <p><strong>Motif :</strong><br>${safeReason}</p>
              <p>Corrigez le problème indiqué et soumettez un nouveau document depuis la page agence.</p>
              <p><a href="${agenceUrl}" style="display:inline-block;background:#064e3b;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Re-soumettre un document</a></p>
              <p style="color:#666;font-size:13px">— L'équipe ImmoDz</p>
            `,
          });
        }
      } catch (emailErr) {
        console.error("[kyc-review] email send failed:", emailErr);
      }
    }

    return NextResponse.json({ id: updated.id, kycStatus: updated.kycStatus });
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
