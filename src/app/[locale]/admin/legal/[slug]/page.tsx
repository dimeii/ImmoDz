import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import LegalEditor from "@/components/admin/LegalEditor";

const VALID_SLUGS = ["mentions-legales", "cgu", "confidentialite"] as const;

export default async function AdminLegalEditPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id) redirect("/login");
  if (role !== "ADMIN") redirect("/");

  if (!(VALID_SLUGS as readonly string[]).includes(params.slug)) notFound();

  const page = await db.legalPage.findUnique({ where: { slug: params.slug } });

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/admin/legal"
            className="text-sm text-primary-950 hover:underline"
          >
            ← Retour aux pages légales
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mt-3">
            Édition · {page?.title ?? params.slug}
          </h1>
          {page && (
            <p className="text-xs text-gray-500 mt-1">
              Version {page.version} · Dernière modification le{" "}
              {page.updatedAt.toLocaleString("fr-DZ", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>

        <LegalEditor
          slug={params.slug}
          initialTitle={page?.title ?? ""}
          initialContent={page?.content ?? ""}
        />
      </div>
    </main>
  );
}
