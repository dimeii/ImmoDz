import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import ProfilForm from "@/components/dashboard/ProfilForm";

export default async function DashboardProfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      phone: true,
      image: true,
      bio: true,
      role: true,
      specialtyTypes: true,
      specialtyWilayas: true,
      acceptsMessages: true,
    },
  });

  if (!user) redirect("/login");

  const isPublicProfile =
    user.role === "AGENCY_DIRECTOR" ||
    user.role === "AGENCY_EMPLOYEE" ||
    user.role === "ADMIN";

  const wilayas = await db.wilaya.findMany({
    orderBy: { code: "asc" },
    select: { code: true, name: true },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm text-primary-950 hover:underline"
          >
            ← Retour au dashboard
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mt-3">Mon profil</h1>
          {isPublicProfile ? (
            <p className="text-gray-500 mt-2">
              Ces informations apparaissent sur votre page publique{" "}
              <Link
                href={`/agents/${user.id}`}
                target="_blank"
                className="text-primary-950 hover:underline font-medium"
              >
                /agents/{user.id.slice(0, 8)}…
              </Link>
            </p>
          ) : (
            <p className="text-gray-500 mt-2">
              Gérez vos informations personnelles.
            </p>
          )}
        </div>

        <ProfilForm
          initial={{
            userId: user.id,
            name: user.name,
            phone: user.phone,
            image: user.image,
            bio: user.bio,
            specialtyTypes: user.specialtyTypes,
            specialtyWilayas: user.specialtyWilayas,
            acceptsMessages: user.acceptsMessages,
          }}
          wilayas={wilayas}
        />
      </div>
    </main>
  );
}
