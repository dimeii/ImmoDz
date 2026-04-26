import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const SLUGS = [
  { slug: "mentions-legales", label: "Mentions légales" },
  { slug: "cgu", label: "Conditions générales d'utilisation" },
  { slug: "confidentialite", label: "Politique de confidentialité" },
];

export default async function AdminLegalPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id) redirect("/login");
  if (role !== "ADMIN") redirect("/");

  const pages = await db.legalPage.findMany({
    where: { slug: { in: SLUGS.map((s) => s.slug) } },
    select: { slug: true, title: true, version: true, updatedAt: true },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Pages légales</h1>
            <p className="text-gray-500 mt-1">Mentions légales, CGU, confidentialité</p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-primary-950 hover:underline">
            ← Retour au back-office
          </Link>
        </div>

        <ul className="rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100">
          {SLUGS.map(({ slug, label }) => {
            const p = pages.find((x) => x.slug === slug);
            return (
              <li key={slug} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{p?.title ?? label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {p
                      ? `Version ${p.version} · Mise à jour le ${p.updatedAt.toLocaleDateString(
                          "fr-DZ",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )}`
                      : "Pas encore créée"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/${slug}`}
                    target="_blank"
                    className="text-xs font-medium px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
                  >
                    Voir
                  </Link>
                  <Link
                    href={`/admin/legal/${slug}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded bg-primary-950 text-white hover:bg-primary-900"
                  >
                    Éditer
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
