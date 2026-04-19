import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

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

function stripLocale(pathname: string): {
  locale: string;
  path: string;
} {
  const match = pathname.match(/^\/(fr|ar)(\/.*|$)/);
  if (match) {
    return { locale: match[1], path: match[2] || "/" };
  }
  return { locale: "fr", path: pathname };
}

function localizedUrl(path: string, locale: string, base: string | URL): URL {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return new URL(`${prefix}${path}`, base);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const { locale, path } = stripLocale(pathname);

  const isGatePath = path === "/gate" || path.startsWith("/gate/");
  if (!isGatePath) {
    const hasAccess = request.cookies.get("site-access")?.value === "granted";
    if (!hasAccess) {
      return NextResponse.redirect(localizedUrl("/gate", locale, request.url));
    }
  }

  const needsAuth = matches(path, AUTH_ROUTES);
  const needsDirector = matches(path, DIRECTOR_ROUTES);
  const needsAdmin = matches(path, ADMIN_ROUTES);

  if (needsAuth || needsDirector || needsAdmin) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = localizedUrl("/login", locale, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (token.role as string | undefined) ?? "USER";

    if (needsAdmin && role !== "ADMIN") {
      return NextResponse.redirect(localizedUrl("/", locale, request.url));
    }

    if (
      needsDirector &&
      role !== "ADMIN" &&
      role !== "AGENCY_DIRECTOR"
    ) {
      return NextResponse.redirect(localizedUrl("/", locale, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|sw.js|manifest.webmanifest).*)",
  ],
};
