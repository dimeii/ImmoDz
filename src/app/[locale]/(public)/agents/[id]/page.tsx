import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import AnnonceCard from "@/components/annonces/AnnonceCard";

interface Props {
  params: { id: string; locale: string };
}

const PROPERTY_LABELS: Record<string, string> = {
  APARTMENT: "Appartement",
  HOUSE: "Maison",
  VILLA: "Villa",
  STUDIO: "Studio",
  LAND: "Terrain",
  COMMERCIAL: "Commercial",
  OFFICE: "Bureau",
  GARAGE: "Garage",
  OTHER: "Autre",
};

export async function generateMetadata({ params }: Props) {
  const user = await db.user.findUnique({
    where: { id: params.id },
    select: { name: true, bio: true },
  });
  if (!user) return { title: "Agent introuvable" };
  return {
    title: `${user.name ?? "Agent"} — ImmoDz`,
    description: user.bio?.slice(0, 160) ?? `Profil de ${user.name ?? "l'agent"} sur ImmoDz`,
  };
}

export default async function AgentProfilePage({ params }: Props) {
  const user = await db.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      phone: true,
      role: true,
      specialtyTypes: true,
      specialtyWilayas: true,
      agencyMembers: {
        include: {
          agency: {
            select: { id: true, slug: true, name: true, logo: true },
          },
        },
        take: 1,
      },
    },
  });

  if (!user) notFound();

  // Seuls les comptes à vocation pro ont un profil public ; les USER bruts 404
  const isPublicProfile =
    user.role === "AGENCY_DIRECTOR" ||
    user.role === "AGENCY_EMPLOYEE" ||
    user.role === "ADMIN";
  if (!isPublicProfile) notFound();

  const membership = user.agencyMembers[0];

  const listings = await db.listing.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    include: {
      wilaya: true,
      photos: { take: 1, orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  const wilayas = user.specialtyWilayas.length
    ? await db.wilaya.findMany({
        where: { code: { in: user.specialtyWilayas } },
        orderBy: { code: "asc" },
      })
    : [];

  const isAr = params.locale === "ar";

  return (
    <main className="min-h-[calc(100vh-80px)] bg-emerald-50/40 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <header className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-emerald-700 font-headline font-bold text-3xl">
                  {(user.name ?? "?").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-emerald-900 tracking-tight">
                {user.name ?? "Agent"}
              </h1>
              <p className="text-sm text-emerald-800/60 mt-1">
                {user.role === "AGENCY_DIRECTOR" ? "Directeur d'agence" : "Agent immobilier"}
              </p>

              {membership && (
                <Link
                  href={`/agences/${membership.agency.slug}`}
                  className="inline-flex items-center gap-3 mt-3 bg-emerald-50 rounded-lg px-3 py-2 hover:bg-emerald-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 overflow-hidden flex items-center justify-center">
                    {membership.agency.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={membership.agency.logo}
                        alt={membership.agency.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-emerald-700 font-headline font-bold text-sm">
                        {membership.agency.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-emerald-900">
                    {membership.agency.name}
                  </span>
                </Link>
              )}

              {user.bio && (
                <p className="mt-4 text-emerald-900/90 leading-relaxed whitespace-pre-line">
                  {user.bio}
                </p>
              )}

              {(user.specialtyTypes.length > 0 || wilayas.length > 0) && (
                <div className="mt-5 space-y-2 text-sm">
                  {user.specialtyTypes.length > 0 && (
                    <div>
                      <span className="font-semibold text-emerald-900">Spécialités : </span>
                      <span className="text-emerald-800/80">
                        {user.specialtyTypes.map((t) => PROPERTY_LABELS[t] ?? t).join(", ")}
                      </span>
                    </div>
                  )}
                  {wilayas.length > 0 && (
                    <div>
                      <span className="font-semibold text-emerald-900">Zones : </span>
                      <span className="text-emerald-800/80">
                        {wilayas
                          .map((w) => (isAr && w.nameAr ? w.nameAr : w.name))
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {user.phone && (
                <a
                  href={`tel:${user.phone}`}
                  className="inline-block mt-5 text-sm text-emerald-800 hover:text-emerald-900 underline underline-offset-2"
                >
                  {user.phone}
                </a>
              )}
            </div>
          </div>
        </header>

        <section>
          <h2 className="text-2xl font-headline font-bold text-emerald-900 mb-5">
            Annonces actives ({listings.length})
          </h2>
          {listings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm py-12 text-center text-emerald-800/60">
              Aucune annonce active pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((l) => (
                <Link key={l.id} href={`/annonces/${l.id}`}>
                  <AnnonceCard
                    id={l.id}
                    title={l.title}
                    price={l.price}
                    transactionType={l.transactionType}
                    propertyType={l.propertyType}
                    surface={l.surface}
                    rooms={l.rooms}
                    wilaya={isAr && l.wilaya.nameAr ? l.wilaya.nameAr : l.wilaya.name}
                    thumbnail={l.photos[0]?.url ?? null}
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
