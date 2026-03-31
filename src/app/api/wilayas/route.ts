import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const wilayas = await db.wilaya.findMany({
      orderBy: { code: "asc" },
    });
    return NextResponse.json(wilayas);
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
