import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_SLUGS = ["mentions-legales", "cgu", "confidentialite"] as const;

const updateSchema = z.object({
  slug: z.enum(VALID_SLUGS),
  title: z.string().trim().min(3).max(200),
  content: z.string().trim().min(10).max(50000),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role !== "ADMIN" || !session?.user?.id) {
      return NextResponse.json({ error: "Réservé aux admins" }, { status: 403 });
    }

    const body = await request.json();
    const { slug, title, content } = updateSchema.parse(body);

    const existing = await db.legalPage.findUnique({ where: { slug } });

    const page = await db.legalPage.upsert({
      where: { slug },
      create: {
        slug,
        title,
        content,
        version: 1,
        updatedBy: session.user.id,
      },
      update: {
        title,
        content,
        version: (existing?.version ?? 0) + 1,
        updatedBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true, version: page.version });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Legal update error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
