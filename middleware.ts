import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip gate check for the gate page and its API
  if (pathname === "/gate" || pathname === "/api/gate") {
    return NextResponse.next();
  }

  // Check site access cookie
  const hasAccess = request.cookies.get("site-access")?.value === "granted";
  if (!hasAccess) {
    return NextResponse.redirect(new URL("/gate", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
