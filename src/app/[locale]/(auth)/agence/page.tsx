import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import AgenceInfoForm from "@/components/agence/AgenceInfoForm";
import AgenceKycSection from "@/components/agence/AgenceKycSection";
import MembreList from "@/components/agence/MembreList";

export default async function AgencePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;

  if (!["AGENCY_DIRECTOR", "AGENCY_EMPLOYEE"].includes(role || "")) {
    redirect("/dashboard");
  }

  const membership = await db.agencyMember.findFirst({
    where: { userId: session.user.id },
    include: {
      agency: {
        include: { wilaya: true },
      },
    },
  });

  if (!membership) {
    redirect("/dashboard");
  }

  const isDirector = membership.role === "AGENCY_DIRECTOR";

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {membership.agency.name}
          </h1>
          <p className="text-gray-500">
            {isDirector
              ? "Vous êtes directeur de cette agence"
              : "Vous êtes agent de cette agence"}
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <Link
            href="/agence"
            className="px-4 py-2 font-semibold text-primary-950 border-b-2 border-primary-950"
          >
            Informations
          </Link>
          {isDirector && (
            <Link
              href="/agence/agents"
              className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
            >
              Agents
            </Link>
          )}
        </div>

        {/* Agence Info */}
        <AgenceInfoForm
          agency={membership.agency}
          memberRole={membership.role as "AGENCY_DIRECTOR" | "AGENCY_EMPLOYEE"}
        />

        {/* KYC */}
        <div className="mt-8">
          <AgenceKycSection
            status={membership.agency.kycStatus}
            documentUrl={membership.agency.kycDocumentUrl}
            submittedAt={membership.agency.kycSubmittedAt}
            reviewedAt={membership.agency.kycReviewedAt}
            rejectionReason={membership.agency.kycRejectionReason}
            isDirector={isDirector}
          />
        </div>

        {/* Membres (lecture seule pour employees) */}
        {!isDirector && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Équipe de l&apos;agence
            </h2>
            <MembreList isDirector={false} />
          </div>
        )}
      </div>
    </main>
  );
}
