import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validations/password-reset";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const tokenHash = hashToken(token);

    const tokenRow = await db.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (
      !tokenRow ||
      tokenRow.usedAt !== null ||
      tokenRow.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Lien invalide ou expiré." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.$transaction([
      db.user.update({
        where: { id: tokenRow.userId },
        data: { password: hashedPassword },
      }),
      db.passwordResetToken.update({
        where: { id: tokenRow.id },
        data: { usedAt: new Date() },
      }),
      // Invalide tous les autres tokens en attente du même user (sécurité)
      db.passwordResetToken.updateMany({
        where: {
          userId: tokenRow.userId,
          id: { not: tokenRow.id },
          usedAt: null,
        },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
