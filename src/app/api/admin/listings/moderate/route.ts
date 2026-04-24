import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getResend } from "@/lib/resend";

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

function baseUrl() {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    "https://immodz.com"
  );
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
    const parsed = moderateSchema.parse(body);

    const listing = await db.listing.findUnique({
      where: { id: parsed.id },
      select: {
        id: true,
        title: true,
        status: true,
        user: { select: { email: true, name: true } },
      },
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

    // Notification email — best-effort (ne doit pas faire échouer la modération)
    if (listing.user.email && process.env.RESEND_API_KEY) {
      const safeTitle = escapeHtml(listing.title);
      const agentName = listing.user.name ?? "";
      const greeting = agentName ? `Bonjour ${escapeHtml(agentName)},` : "Bonjour,";

      try {
        if (parsed.action === "approve") {
          const url = `${baseUrl()}/annonces/${listing.id}`;
          await getResend().emails.send({
            from: "ImmoDz <noreply@immodz.com>",
            to: listing.user.email,
            subject: `Votre annonce "${listing.title}" a été publiée`,
            html: `
              <p>${greeting}</p>
              <p>Bonne nouvelle : votre annonce <strong>${safeTitle}</strong> a été approuvée et est désormais visible publiquement sur ImmoDz.</p>
              <p><a href="${url}" style="display:inline-block;background:#064e3b;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Voir mon annonce</a></p>
              <p style="color:#666;font-size:13px">— L'équipe ImmoDz</p>
            `,
          });
        } else {
          const url = `${baseUrl()}/dashboard`;
          const safeReason = escapeHtml(parsed.reason);
          await getResend().emails.send({
            from: "ImmoDz <noreply@immodz.com>",
            to: listing.user.email,
            subject: `Votre annonce "${listing.title}" n'a pas été publiée`,
            html: `
              <p>${greeting}</p>
              <p>Votre annonce <strong>${safeTitle}</strong> n'a pas été approuvée par notre équipe.</p>
              <p><strong>Motif :</strong><br>${safeReason}</p>
              <p>Vous pouvez corriger puis soumettre à nouveau depuis votre tableau de bord.</p>
              <p><a href="${url}" style="display:inline-block;background:#064e3b;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Ouvrir mon tableau de bord</a></p>
              <p style="color:#666;font-size:13px">— L'équipe ImmoDz</p>
            `,
          });
        }
      } catch (emailErr) {
        console.error("[moderate] email send failed:", emailErr);
      }
    }

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
