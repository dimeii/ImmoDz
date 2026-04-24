import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Ensuring PostGIS extension is enabled...");
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS postgis`);

  console.log("Ensuring listings.location column exists...");
  await prisma.$executeRawUnsafe(
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326)`
  );

  console.log("Ensuring GIST index on listings.location...");
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS listings_location_gist ON listings USING GIST(location)`
  );

  console.log("Syncing location column from latitude/longitude...");
  const missing = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint as count
    FROM listings
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND location IS NULL
  `;
  const missingCount = Number(missing[0]?.count ?? 0);
  console.log(`Found ${missingCount} listings to sync.`);

  if (missingCount === 0) {
    console.log("Nothing to sync.");
    return;
  }

  const updated = await prisma.$executeRaw`
    UPDATE listings
    SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND location IS NULL
  `;

  console.log(`Updated ${updated} rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
