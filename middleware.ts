export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/annonces/nouvelle",
    "/annonces/:id/edit",
    "/agence/:path*",
    "/admin/:path*",
  ],
};
