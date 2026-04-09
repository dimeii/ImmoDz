import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function parseCsvLine(line: string): string[] {
  // Simple semicolon-delimited parse (no semicolons inside fields based on data inspection)
  return line.split(";");
}

function mapPropertyType(raw: string): string {
  const map: Record<string, string> = {
    APARTMENT: "APARTMENT",
    HOUSE: "HOUSE",
    VILLA: "VILLA",
    STUDIO: "STUDIO",
    LAND: "LAND",
    COMMERCIAL: "COMMERCIAL",
    OFFICE: "OFFICE",
    GARAGE: "GARAGE",
    OTHER: "OTHER",
  };
  return map[raw] || "OTHER";
}

function mapTransactionType(raw: string): string {
  return raw === "SALE" ? "SALE" : "RENT";
}

async function main() {
  console.log("Importing scraped listings from CSV...");

  const csvPath = path.join(__dirname, "scraped-listings.csv");
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());

  // Skip header
  const header = lines[0];
  const dataLines = lines.slice(1);

  console.log(`Found ${dataLines.length} listings to import.`);

  // Get a user to assign listings to
  const users = await prisma.user.findMany({ take: 5 });
  if (users.length === 0) {
    console.error("No users found. Run the main seed first.");
    process.exit(1);
  }

  // Get existing wilayas
  const wilayas = await prisma.wilaya.findMany();
  const wilayaCodes = new Set(wilayas.map((w) => w.code));

  let created = 0;
  let skipped = 0;

  for (const line of dataLines) {
    const fields = parseCsvLine(line);
    if (fields.length < 21) {
      skipped++;
      continue;
    }

    const [
      okId,
      title,
      description,
      priceStr,
      transactionType,
      propertyType,
      wilayaCodeStr,
      _wilayaName,
      commune,
      latStr,
      lngStr,
      surfaceStr,
      roomsStr,
      bedroomsStr,
      bathroomsStr,
      hasElevatorStr,
      hasParkingStr,
      hasGardenStr,
      hasPoolStr,
      isFurnishedStr,
      photosStr,
      _sourceUrl,
    ] = fields;

    const wilayaCode = parseInt(wilayaCodeStr);
    if (!wilayaCodes.has(wilayaCode)) {
      skipped++;
      continue;
    }

    const price = parseFloat(priceStr) || 0;
    const latitude = parseFloat(latStr) || null;
    const longitude = parseFloat(lngStr) || null;
    const surface = parseFloat(surfaceStr) || null;
    const rooms = parseInt(roomsStr) || null;
    const bedrooms = parseInt(bedroomsStr) || null;
    const bathrooms = parseInt(bathroomsStr) || null;

    const photos = photosStr
      ? photosStr.split("|").filter((u) => u.trim())
      : [];

    try {
      const listing = await prisma.listing.create({
        data: {
          title: title.slice(0, 255),
          description: description || title,
          price,
          transactionType: mapTransactionType(transactionType) as any,
          propertyType: mapPropertyType(propertyType) as any,
          status: "ACTIVE",
          wilayaCode,
          commune: commune || null,
          latitude,
          longitude,
          surface,
          rooms,
          bedrooms,
          bathrooms,
          hasElevator: hasElevatorStr === "1",
          hasParking: hasParkingStr === "1",
          hasGarden: hasGardenStr === "1",
          hasPool: hasPoolStr === "1",
          isFurnished: isFurnishedStr === "1",
          userId: users[Math.floor(Math.random() * users.length)].id,
        },
      });

      // Create photo records
      if (photos.length > 0) {
        await prisma.listingPhoto.createMany({
          data: photos.map((url, index) => ({
            listingId: listing.id,
            url,
            publicId: `scraped_${okId}_${index}`,
            category: "OTHER" as any,
            order: index,
          })),
        });
      }

      created++;
    } catch (err) {
      console.error(`Error importing listing "${title}":`, err);
      skipped++;
    }
  }

  // Update PostGIS location column for listings with coordinates
  try {
    await prisma.$executeRawUnsafe(`
      UPDATE listings
      SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL
    `);
    console.log("PostGIS location column updated.");
  } catch (err) {
    console.log("PostGIS update skipped (column may not exist):", (err as Error).message);
  }

  console.log(`Done! Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
