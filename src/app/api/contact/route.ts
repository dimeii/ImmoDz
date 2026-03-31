import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { resend } from "@/lib/resend";
import { contactSchema } from "@/lib/validations/contact";
import { RATE_LIMITS } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Rate limit par IP
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rateLimitKey = `contact:rate:${ip}`;
    const currentCount = (await redis.get<number>(rateLimitKey)) ?? 0;

    if (currentCount >= RATE_LIMITS.CONTACT_PER_HOUR) {
      return NextResponse.json(
        { error: "Trop de messages envoyés. Réessayez dans une heure." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = contactSchema.parse(body);

    // Récupérer l'annonce et le propriétaire
    const listing = await db.listing.findUnique({
      where: { id: validated.listingId },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!listing || listing.status !== "ACTIVE") {
      return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    }

    // Enregistrer en BDD
    await db.contactRequest.create({
      data: {
        listingId: validated.listingId,
        senderId: session.user.id,
        receiverId: listing.userId,
        message: validated.message,
        phone: validated.phone,
      },
    });

    // Envoyer email au propriétaire
    if (listing.user.email) {
      await resend.emails.send({
        from: "ImmoDz <noreply@immodz.com>",
        to: listing.user.email,
        subject: `Nouveau message pour "${listing.title}"`,
        html: `
          <h2>Nouveau message pour votre annonce</h2>
          <p><strong>Annonce :</strong> ${listing.title}</p>
          <p><strong>De :</strong> ${session.user.name ?? session.user.email}</p>
          ${validated.phone ? `<p><strong>Téléphone :</strong> ${validated.phone}</p>` : ""}
          <p><strong>Message :</strong></p>
          <p>${validated.message}</p>
        `,
      });
    }

    // Accusé de réception
    if (session.user.email) {
      await resend.emails.send({
        from: "ImmoDz <noreply@immodz.com>",
        to: session.user.email,
        subject: `Votre message a été envoyé — "${listing.title}"`,
        html: `
          <h2>Message envoyé avec succès</h2>
          <p>Votre message concernant l'annonce <strong>${listing.title}</strong> a bien été transmis au propriétaire.</p>
        `,
      });
    }

    // Incrémenter rate limit (expire dans 1h)
    await redis.incr(rateLimitKey);
    if (currentCount === 0) {
      await redis.expire(rateLimitKey, 3600);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    console.error("Contact error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
