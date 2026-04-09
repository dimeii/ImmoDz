import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import MembreList from "@/components/agence/MembreList";
import InviterMembreForm from "@/components/agence/InviterMembreForm";

export default async function AgenceAgentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;

  if (role !== "AGENCY_DIRECTOR") {
    redirect("/agence");
  }

  const membership = await db.agencyMember.findFirst({
    where: { userId: session.user.id },
    include: {
      agency: true,
    },
  });

  if (!membership) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/agence"
              className="text-primary-950 hover:text-primary-900 font-semibold"
            >
              ← Retour
            </Link>
          </div>
          <h1 className="text-3xl font-black text-gray-900">
            Gestion des agents
          </h1>
          <p className="text-gray-500 mt-2">
            {membership.agency.name}
          </p>
        </div>

        {/* Formulaire d'invitation */}
        <InviterMembreForm />

        {/* Liste des membres */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Équipe
          </h2>
          <MembreList isDirector={true} />
        </div>
      </div>
    </main>
  );
}
