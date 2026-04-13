import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_ROUTES = [
  /^\/dashboard(\/|$)/,
  /^\/annonces\/nouvelle(\/|$)/,
  /^\/annonces\/[^/]+\/edit(\/|$)/,
];

const DIRECTOR_ROUTES = [/^\/agence(\/|$)/];
const ADMIN_ROUTES = [/^\/admin(\/|$)/];

function matches(pathname: string, patterns: RegExp[]) {
  return patterns.some((re) => re.test(pathname));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/gate" || pathname.startsWith("/api/gate")) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hasAccess = request.cookies.get("site-access")?.value === "granted";
  if (!hasAccess) {
    return NextResponse.redirect(new URL("/gate", request.url));
  }

  const needsAuth = matches(pathname, AUTH_ROUTES);
  const needsDirector = matches(pathname, DIRECTOR_ROUTES);
  const needsAdmin = matches(pathname, ADMIN_ROUTES);

  if (!needsAuth && !needsDirector && !needsAdmin) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (token.role as string | undefined) ?? "USER";

  if (needsAdmin && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    needsDirector &&
    role !== "ADMIN" &&
    role !== "AGENCY_DIRECTOR"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
