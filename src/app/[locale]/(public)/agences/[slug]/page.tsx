import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import AnnonceCard from "@/components/annonces/AnnonceCard";
import VerifiedBadge from "@/components/agence/VerifiedBadge";

interface Props {
  params: { slug: string; locale: string };
}

export async function generateMetadata({ params }: Props) {
  const agency = await db.agency.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true },
  });
  if (!agency) return { title: "Agence introuvable" };
  return {
    title: `${agency.name} — ImmoDz`,
    description: agency.description?.slice(0, 160) ?? `Découvrez ${agency.name} sur ImmoDz`,
  };
}

export default async function AgencyDetailPage({ params }: Props) {
  const agency = await db.agency.findUnique({
    where: { slug: params.slug },
    include: {
      wilaya: true,
      members: {
        include: {
          user: {
            select: { id: true, name: true, image: true, bio: true, phone: true },
          },
        },
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
      },
      _count: {
        select: {
          listings: { where: { status: "ACTIVE" } },
        },
      },
    },
  });

  if (!agency) notFound();

  const listings = await db.listing.findMany({
    where: { agencyId: agency.id, status: "ACTIVE" },
    include: {
      wilaya: true,
      photos: { take: 1, orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  const isAr = params.locale === "ar";

  return (
    <main className="min-h-[calc(100vh-80px)] bg-emerald-50/40 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {agency.coverImage && (
          <div
            className="h-56 md:h-72 rounded-xl bg-emerald-100 bg-cover bg-center mb-8 shadow-sm"
            style={{ backgroundImage: `url(${agency.coverImage})` }}
          />
        )}

        <header className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
              {agency.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={agency.logo}
                  alt={agency.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-emerald-700 font-headline font-bold text-3xl">
                  {agency.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-emerald-900 tracking-tight">
                  {agency.name}
                </h1>
                {agency.kycStatus === "VERIFIED" && <VerifiedBadge size="md" />}
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-emerald-800/70">
                {agency.wilaya && (
                  <span>
                    {isAr && agency.wilaya.nameAr ? agency.wilaya.nameAr : agency.wilaya.name}
                  </span>
                )}
                {agency.foundedYear && <span>· Depuis {agency.foundedYear}</span>}
                <span>· {agency._count.listings} annonces actives</span>
              </div>
              {agency.description && (
                <p className="mt-4 text-emerald-900/90 leading-relaxed whitespace-pre-line">
                  {agency.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-4 text-sm">
                {agency.phone && (
                  <a
                    href={`tel:${agency.phone}`}
                    className="text-emerald-800 hover:text-emerald-900 underline underline-offset-2"
                  >
                    {agency.phone}
                  </a>
                )}
                {agency.email && (
                  <a
                    href={`mailto:${agency.email}`}
                    className="text-emerald-800 hover:text-emerald-900 underline underline-offset-2"
                  >
                    {agency.email}
                  </a>
                )}
                {agency.website && (
                  <a
                    href={agency.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-800 hover:text-emerald-900 underline underline-offset-2"
                  >
                    {agency.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {agency.address && <span className="text-emerald-800/70">{agency.address}</span>}
              </div>
            </div>
          </div>
        </header>

        {agency.members.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-headline font-bold text-emerald-900 mb-5">
              Équipe
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {agency.members.map((m) => (
                <Link
                  key={m.id}
                  href={`/agents/${m.user.id}`}
                  className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-center group"
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 overflow-hidden flex items-center justify-center mb-3">
                    {m.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.user.image}
                        alt={m.user.name ?? ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-emerald-700 font-headline font-bold text-xl">
                        {(m.user.name ?? "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="font-headline font-semibold text-emerald-900 text-sm group-hover:underline underline-offset-2 truncate">
                    {m.user.name ?? "—"}
                  </p>
                  <p className="text-xs text-emerald-800/60 mt-0.5">
                    {m.role === "AGENCY_DIRECTOR" ? "Directeur" : "Agent"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-headline font-bold text-emerald-900 mb-5">
            Annonces actives ({agency._count.listings})
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
