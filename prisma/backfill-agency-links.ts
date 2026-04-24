import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string, excludeId: string): Promise<string> {
  let candidate = base || "agence";
  let suffix = 1;
  while (true) {
    const existing = await db.agency.findFirst({
      where: { slug: candidate, NOT: { id: excludeId } },
      select: { id: true },
    });
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

async function backfillSlugs() {
  const agencies = await db.agency.findMany({
    where: { slug: null },
    select: { id: true, name: true },
  });

  console.log(`[slugs] ${agencies.length} agences à traiter`);
  for (const a of agencies) {
    const base = slugify(a.name);
    const slug = await uniqueSlug(base, a.id);
    await db.agency.update({ where: { id: a.id }, data: { slug } });
    console.log(`  ${a.name} → ${slug}`);
  }
}

async function backfillListingAgencyId() {
  // Pour chaque listing sans agencyId dont le user a une AgencyMember : assigner
  const orphans = await db.listing.findMany({
    where: { agencyId: null },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          agencyMembers: {
            select: { agencyId: true, joinedAt: true },
            orderBy: { joinedAt: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  let linked = 0;
  for (const listing of orphans) {
    const membership = listing.user.agencyMembers[0];
    if (!membership) continue;
    await db.listing.update({
      where: { id: listing.id },
      data: { agencyId: membership.agencyId },
    });
    linked += 1;
  }
  console.log(`[listings] ${linked}/${orphans.length} annonces liées à une agence`);
}

async function main() {
  await backfillSlugs();
  await backfillListingAgencyId();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
