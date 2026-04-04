import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip gate check for the gate page itself and its API
  if (pathname === "/gate" || pathname === "/api/gate") {
    return NextResponse.next();
  }

  // Check site access cookie
  const hasAccess = request.cookies.get("site-access")?.value === "granted";
  if (!hasAccess) {
    return NextResponse.redirect(new URL("/gate", request.url));
  }

  // Auth-protected routes — delegate to NextAuth
  const authRoutes = ["/dashboard", "/annonces/nouvelle", "/agence", "/admin"];
  const needsAuth = authRoutes.some(
    (route) => pathname.startsWith(route) || pathname.match(/^\/annonces\/[^/]+\/edit/)
  );

  if (needsAuth) {
    return (auth as any)(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
