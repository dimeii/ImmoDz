import { NextRequest, NextResponse } from "next/server";

const SITE_PASSWORD = process.env.SITE_PASSWORD || "immoDz";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password !== SITE_PASSWORD) {
      return NextResponse.json({ error: "Incorrect" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("site-access", "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
