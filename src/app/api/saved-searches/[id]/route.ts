import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const search = await db.savedSearch.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!search) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }

    if (search.userId !== session.user.id) {
      return NextResponse.json({ error: "Interdit" }, { status: 403 });
    }

    await db.savedSearch.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/saved-searches/[id] error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
