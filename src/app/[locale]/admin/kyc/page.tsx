import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import KycQueue from "@/components/admin/KycQueue";

export default async function AdminKycPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id) redirect("/login");
  if (role !== "ADMIN") redirect("/");

  const pending = await db.agency.findMany({
    where: { kycStatus: "PENDING" },
    orderBy: { kycSubmittedAt: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      logo: true,
      kycDocumentUrl: true,
      kycSubmittedAt: true,
      wilaya: { select: { name: true } },
      members: {
        where: { role: "AGENCY_DIRECTOR" },
        select: { user: { select: { name: true, email: true } } },
        take: 1,
      },
    },
  });

  const serialized = pending.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    logo: a.logo,
    kycDocumentUrl: a.kycDocumentUrl,
    kycSubmittedAt: a.kycSubmittedAt?.toISOString() ?? null,
    wilaya: a.wilaya ? { name: a.wilaya.name } : null,
    director: a.members[0]?.user ?? null,
  }));

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-primary-950 hover:underline">
            ← Retour
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mt-3">
            KYC agences — {pending.length} en attente
          </h1>
          <p className="text-gray-500 mt-1">
            Vérifiez les registres du commerce uploadés par les agences. Les
            approbations font apparaître le badge "Vérifié" sur leur fiche
            publique et leurs annonces. Une décision envoie un email au directeur.
          </p>
        </div>

        <KycQueue initial={serialized} />
      </div>
    </main>
  );
}
