import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getResend } from "@/lib/resend";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderEmail(
  recipientName: string | null,
  senderName: string,
  listingTitle: string | null,
  preview: string,
  threadUrl: string
): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2 style="color:#003527;">Bonjour ${escapeHtml(recipientName ?? "")},</h2>
      <p style="color:#333;">
        Vous avez un nouveau message de <strong>${escapeHtml(senderName)}</strong>${
          listingTitle
            ? ` au sujet de l'annonce <strong>« ${escapeHtml(listingTitle)} »</strong>`
            : ""
        }.
      </p>
      <blockquote style="border-left:3px solid #003527;padding:8px 16px;color:#555;background:#f6f6f6;border-radius:4px;margin:16px 0;">
        ${escapeHtml(preview)}
      </blockquote>
      <p style="margin-top:24px;">
        <a href="${threadUrl}" style="background:#003527;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          Répondre sur ImmoDz
        </a>
      </p>
      <p style="color:#999;font-size:12px;margin-top:24px;">
        Vous recevez cet email car vous avez un message non lu depuis plus de 5 minutes sur ImmoDz.
      </p>
    </div>
  `;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://immodz.com";
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

  const messages = await db.threadMessage.findMany({
    where: {
      createdAt: { lt: fiveMinAgo },
      readAt: null,
      notifiedAt: null,
    },
    include: {
      sender: { select: { name: true, email: true } },
      thread: {
        select: {
          id: true,
          initiatorId: true,
          recipientId: true,
          listing: { select: { title: true } },
          initiator: { select: { id: true, name: true, email: true } },
          recipient: { select: { id: true, name: true, email: true } },
        },
      },
    },
    take: 100,
    orderBy: { createdAt: "asc" },
  });

  let emailsSent = 0;
  const notifiedIds: string[] = [];

  for (const msg of messages) {
    const isFromInitiator = msg.senderId === msg.thread.initiatorId;
    const recipient = isFromInitiator
      ? msg.thread.recipient
      : msg.thread.initiator;

    if (!recipient.email) {
      notifiedIds.push(msg.id);
      continue;
    }

    const preview =
      msg.body.length > 200 ? msg.body.slice(0, 200) + "…" : msg.body;
    const threadUrl = `${baseUrl}/dashboard/messages?thread=${msg.thread.id}`;

    try {
      await getResend().emails.send({
        from: "ImmoDz <noreply@immodz.com>",
        to: recipient.email,
        subject: msg.thread.listing
          ? `Nouveau message — ${msg.thread.listing.title}`
          : `Nouveau message sur ImmoDz`,
        html: renderEmail(
          recipient.name,
          msg.sender.name ?? "Un utilisateur",
          msg.thread.listing?.title ?? null,
          preview,
          threadUrl
        ),
      });
      emailsSent++;
      notifiedIds.push(msg.id);
    } catch (err) {
      console.error("Notify email failed for message", msg.id, err);
    }
  }

  if (notifiedIds.length > 0) {
    await db.threadMessage.updateMany({
      where: { id: { in: notifiedIds } },
      data: { notifiedAt: new Date() },
    });
  }

  return NextResponse.json({
    processed: messages.length,
    emailsSent,
    notified: notifiedIds.length,
  });
}
