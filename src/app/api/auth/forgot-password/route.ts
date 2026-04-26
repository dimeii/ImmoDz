import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { getRedis } from "@/lib/redis";
import { getResend } from "@/lib/resend";
import { forgotPasswordSchema } from "@/lib/validations/password-reset";

const TOKEN_TTL_MIN = 60;
const RATE_LIMIT_PER_HOUR = 3;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
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
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rateKey = `pw-reset:${ip}`;
    const redis = getRedis();
    let rateCount = 0;
    try {
      rateCount = (await redis.get<number>(rateKey)) ?? 0;
      if (rateCount >= RATE_LIMIT_PER_HOUR) {
        return NextResponse.json(
          { error: "Trop de demandes. Réessayez dans une heure." },
          { status: 429 }
        );
      }
    } catch (err) {
      console.warn("Redis unavailable, skipping rate limit:", err);
    }

    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    // Réponse identique que l'email existe ou non — anti énumération de comptes.
    if (user && user.email) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + TOKEN_TTL_MIN * 60 * 1000);

      await db.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });

      const baseUrl = process.env.NEXTAUTH_URL ?? "https://immodz.com";
      const resetUrl = `${baseUrl}/reinitialisation/${rawToken}`;

      try {
        await getResend().emails.send({
          from: "ImmoDz <noreply@immodz.com>",
          to: user.email,
          subject: "Réinitialisation de votre mot de passe ImmoDz",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
              <h2 style="color:#003527;">Bonjour ${escapeHtml(user.name ?? "")},</h2>
              <p style="color:#333;">
                Vous avez demandé la réinitialisation de votre mot de passe sur ImmoDz.
              </p>
              <p style="margin:24px 0;">
                <a href="${resetUrl}" style="background:#003527;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
                  Réinitialiser mon mot de passe
                </a>
              </p>
              <p style="color:#666;font-size:13px;">
                Ce lien expire dans ${TOKEN_TTL_MIN} minutes. Si vous n'êtes pas à l'origine de cette demande,
                ignorez simplement cet email — votre mot de passe restera inchangé.
              </p>
              <p style="color:#999;font-size:12px;margin-top:24px;word-break:break-all;">
                Si le bouton ne fonctionne pas : ${resetUrl}
              </p>
            </div>
          `,
        });
      } catch (err) {
        console.error("Password reset email failed:", err);
        // Ne pas exposer l'erreur au client (anti énumération)
      }
    }

    try {
      await redis.incr(rateKey);
      if (rateCount === 0) await redis.expire(rateKey, 3600);
    } catch (err) {
      console.warn("Redis incr failed:", err);
    }

    return NextResponse.json({
      success: true,
      message:
        "Si cet email est associé à un compte, vous recevrez un lien de réinitialisation dans quelques instants.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
