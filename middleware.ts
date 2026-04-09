import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip gate page and its API
  if (pathname === "/gate" || pathname.startsWith("/api/gate")) {
    return NextResponse.next();
  }

  // Skip static assets and API auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check site access cookie
  const hasAccess = request.cookies.get("site-access")?.value === "granted";
  if (!hasAccess) {
    return NextResponse.redirect(new URL("/gate", request.url));
  }

  return NextResponse.next();
}
