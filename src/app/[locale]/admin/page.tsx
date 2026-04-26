import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id) redirect("/login");
  if (role !== "ADMIN") redirect("/");

  const [pending, active, rejected, users, agencies, kycPending, reportsPending] =
    await Promise.all([
      db.listing.count({ where: { status: "PENDING" } }),
      db.listing.count({ where: { status: "ACTIVE" } }),
      db.listing.count({ where: { status: "REJECTED" } }),
      db.user.count(),
      db.agency.count(),
      db.agency.count({ where: { kycStatus: "PENDING" } }),
      db.listingReport.count({ where: { status: "PENDING" } }),
    ]);

  const cards = [
    {
      label: "En attente de modération",
      value: pending,
      href: "/admin/moderation",
      accent: pending > 0 ? "bg-yellow-50 border-yellow-200" : "bg-white border-gray-100",
      valueClass: pending > 0 ? "text-yellow-700" : "text-gray-900",
      cta: "Modérer →",
    },
    {
      label: "KYC en attente",
      value: kycPending,
      href: "/admin/kyc",
      accent: kycPending > 0 ? "bg-yellow-50 border-yellow-200" : "bg-white border-gray-100",
      valueClass: kycPending > 0 ? "text-yellow-700" : "text-gray-900",
      cta: "Vérifier →",
    },
    {
      label: "Signalements",
      value: reportsPending,
      href: "/admin/reports",
      accent: reportsPending > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-100",
      valueClass: reportsPending > 0 ? "text-red-700" : "text-gray-900",
      cta: "Traiter →",
    },
    {
      label: "Annonces actives",
      value: active,
      href: "/recherche",
      accent: "bg-white border-gray-100",
      valueClass: "text-emerald-700",
      cta: "Voir →",
    },
    {
      label: "Annonces rejetées",
      value: rejected,
      href: null,
      accent: "bg-white border-gray-100",
      valueClass: "text-gray-700",
    },
    {
      label: "Utilisateurs",
      value: users,
      href: null,
      accent: "bg-white border-gray-100",
      valueClass: "text-gray-900",
    },
    {
      label: "Agences",
      value: agencies,
      href: "/agences",
      accent: "bg-white border-gray-100",
      valueClass: "text-gray-900",
      cta: "Voir →",
    },
    {
      label: "Pages légales",
      value: "—",
      href: "/admin/legal",
      accent: "bg-white border-gray-100",
      valueClass: "text-gray-700",
      cta: "Éditer →",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Administration</h1>
          <p className="text-gray-500 mt-1">Back-office ImmoDz</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cards.map((c) => {
            const inner = (
              <div
                className={`rounded-2xl border p-5 shadow-sm h-full ${c.accent}`}
              >
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {c.label}
                </p>
                <p className={`text-3xl font-black mt-2 ${c.valueClass}`}>
                  {c.value}
                </p>
                {c.cta && (
                  <p className="text-xs text-primary-950 font-semibold mt-3">
                    {c.cta}
                  </p>
                )}
              </div>
            );
            return c.href ? (
              <Link key={c.label} href={c.href} className="block hover:scale-[1.01] transition-transform">
                {inner}
              </Link>
            ) : (
              <div key={c.label}>{inner}</div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
