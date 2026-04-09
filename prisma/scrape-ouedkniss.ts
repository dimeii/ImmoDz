import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Config ──────────────────────────────────────────────
const GRAPHQL_URL = "https://api.ouedkniss.com/graphql";
const PAGES_TO_SCRAPE = 30; // 10 per page = ~300 listings
const DELAY_MS = 500; // polite delay between requests

// ─── Wilayas avec quartiers (pour extraction) ───────────
const WILAYAS_WITH_QUARTIERS = new Set([16, 31, 27, 25, 23, 19]); // Alger, Oran, Mostaganem, Constantine, Annaba, Sétif

// ─── Coordinate fallback by wilaya code ──────────────────
const wilayaCoords: Record<number, { lat: number; lng: number }> = {
  1: { lat: 27.8742, lng: -0.2939 },
  2: { lat: 36.165, lng: 1.3346 },
  3: { lat: 33.8, lng: 2.865 },
  4: { lat: 35.8756, lng: 7.1097 },
  5: { lat: 35.5619, lng: 6.1745 },
  6: { lat: 36.7508, lng: 5.0567 },
  7: { lat: 34.848, lng: 5.7286 },
  8: { lat: 31.6167, lng: -2.2167 },
  9: { lat: 36.4699, lng: 2.8277 },
  10: { lat: 36.3729, lng: 3.9003 },
  11: { lat: 22.785, lng: 5.5228 },
  12: { lat: 35.4042, lng: 8.1244 },
  13: { lat: 34.878, lng: -1.315 },
  14: { lat: 35.371, lng: 1.315 },
  15: { lat: 36.7155, lng: 4.2559 },
  16: { lat: 36.737, lng: 3.0588 },
  17: { lat: 34.6704, lng: 3.25 },
  18: { lat: 36.8206, lng: 5.7667 },
  19: { lat: 36.1899, lng: 5.3669 },
  20: { lat: 34.83, lng: 0.1525 },
  21: { lat: 36.8667, lng: 6.9 },
  22: { lat: 35.1897, lng: -0.6308 },
  23: { lat: 36.906, lng: 7.1663 },
  24: { lat: 36.4617, lng: 7.4264 },
  25: { lat: 36.3791, lng: 6.6145 },
  26: { lat: 36.2675, lng: 2.75 },
  27: { lat: 35.9311, lng: 0.0892 },
  28: { lat: 35.7053, lng: 4.5425 },
  29: { lat: 35.3975, lng: 0.1403 },
  30: { lat: 31.9497, lng: 5.325 },
  31: { lat: 35.6953, lng: -0.6435 },
  32: { lat: 33.6833, lng: 1.0167 },
  33: { lat: 26.5089, lng: 8.4811 },
  34: { lat: 36.0686, lng: 4.7628 },
  35: { lat: 36.5244, lng: 3.4822 },
  36: { lat: 36.7669, lng: 8.3136 },
  37: { lat: 27.6742, lng: -8.1478 },
  38: { lat: 35.6072, lng: 1.8106 },
  39: { lat: 33.3683, lng: 6.8673 },
  40: { lat: 35.4358, lng: 7.1417 },
  41: { lat: 36.2861, lng: 7.9511 },
  42: { lat: 36.5894, lng: 2.4472 },
  43: { lat: 36.4508, lng: 6.2644 },
  44: { lat: 36.264, lng: 1.968 },
  45: { lat: 33.2667, lng: -0.3167 },
  46: { lat: 35.2972, lng: -1.1403 },
  47: { lat: 32.4903, lng: 3.6736 },
  48: { lat: 35.7375, lng: 0.5567 },
  49: { lat: 33.95, lng: 5.917 },
  50: { lat: 30.5833, lng: 2.8833 },
  51: { lat: 34.4333, lng: 5.0667 },
  52: { lat: 21.3333, lng: 0.95 },
  53: { lat: 30.1333, lng: -2.1667 },
  54: { lat: 29.2639, lng: 0.23 },
  55: { lat: 33.1, lng: 6.0667 },
  56: { lat: 24.555, lng: 9.4853 },
  57: { lat: 27.1939, lng: 2.4731 },
  58: { lat: 19.5667, lng: 5.7667 },
};

// ─── Category slug → our enums ──────────────────────────
function mapCategory(slugs: string[]): {
  transactionType: "RENT" | "SALE";
  propertyType: string;
} {
  const slugSet = new Set(slugs);

  const transactionType = slugSet.has("immobilier-location") ||
    slugs.some((s) => s.includes("location"))
    ? "RENT"
    : "SALE";

  let propertyType = "OTHER";
  if (slugs.some((s) => s.includes("appartement"))) propertyType = "APARTMENT";
  else if (slugs.some((s) => s.includes("villa"))) propertyType = "VILLA";
  else if (slugs.some((s) => s.includes("maison"))) propertyType = "HOUSE";
  else if (slugs.some((s) => s.includes("studio"))) propertyType = "STUDIO";
  else if (slugs.some((s) => s.includes("terrain"))) propertyType = "LAND";
  else if (slugs.some((s) => s.includes("local"))) propertyType = "COMMERCIAL";
  else if (slugs.some((s) => s.includes("bureau"))) propertyType = "OFFICE";
  else if (slugs.some((s) => s.includes("garage"))) propertyType = "GARAGE";

  return { transactionType, propertyType };
}

// ─── Parse rooms from title (F3, F4, etc.) ──────────────
function parseRooms(title: string): number | null {
  const match = title.match(/\bF(\d)\b/i);
  return match ? parseInt(match[1]) : null;
}

// ─── Parse surface from description ─────────────────────
function parseSurface(text: string): number | null {
  const match = text.match(/(\d{2,4})\s*(?:m²|m2|metre|mètre)/i);
  return match ? parseInt(match[1]) : null;
}

// ─── Estimate bedrooms from rooms ───────────────────────
function estimateBedrooms(rooms: number | null): number | null {
  if (!rooms) return null;
  if (rooms <= 1) return 1;
  return rooms - 1;
}

// ─── GraphQL query ──────────────────────────────────────
const SEARCH_QUERY = `
  query SearchImmobilier($page: Int) {
    search(filter: { categorySlug: "immobilier", page: $page }) {
      announcements {
        data {
          id
          title
          description
          price
          priceUnit
          priceType
          categories { slug name }
          defaultMedia { mediaUrl }
          cities { name region { id name } }
          medias { mediaUrl }
        }
        paginatorInfo {
          currentPage
          lastPage
          total
        }
      }
    }
  }
`;

interface OKAnnouncement {
  id: string;
  title: string;
  description: string;
  price: number | null;
  priceUnit: string;
  priceType: string | null;
  categories: { slug: string; name: string }[];
  defaultMedia: { mediaUrl: string } | null;
  cities: { name: string; region: { id: string; name: string } }[];
  medias: { mediaUrl: string }[];
}

async function fetchPage(page: number): Promise<{
  data: OKAnnouncement[];
  lastPage: number;
  total: number;
}> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: SEARCH_QUERY,
      variables: { page },
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  const { data, paginatorInfo } = json.data.search.announcements;
  return {
    data,
    lastPage: paginatorInfo.lastPage,
    total: paginatorInfo.total,
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("=== OuedKniss Immobilier Scraper ===\n");

  // Ensure wilayas exist
  const wilayaCount = await prisma.wilaya.count();
  if (wilayaCount === 0) {
    console.error("No wilayas in DB. Run the main seed first: npm run db:seed");
    process.exit(1);
  }

  // Get valid wilaya codes from DB
  const dbWilayas = await prisma.wilaya.findMany({ select: { code: true } });
  const validWilayaCodes = new Set(dbWilayas.map((w) => w.code));

  // Load quartiers map for lookup: "quartierName-wilayaCode" → id
  const allQuartiers = await prisma.quartier.findMany({
    select: { id: true, name: true, wilayaCode: true },
  });
  const quartierMap = new Map(
    allQuartiers.map((q) => [`${q.name.toLowerCase()}-${q.wilayaCode}`, q.id])
  );
  console.log(`Loaded ${quartierMap.size} quartiers for matching`);

  // We need a user to attach listings to
  let scrapeUser = await prisma.user.findFirst({
    where: { email: "scraper@immodz.local" },
  });
  if (!scrapeUser) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    scrapeUser = await prisma.user.create({
      data: {
        email: "scraper@immodz.local",
        name: "OuedKniss Import",
        password: hashedPassword,
        role: "USER",
      },
    });
    console.log("Created scraper user: scraper@immodz.local");
  }

  // Track existing ouedkniss IDs to avoid duplicates via title+wilaya combo AND photo publicId
  const existingPhotos = await prisma.listingPhoto.findMany({
    where: { publicId: { startsWith: "ouedkniss-" } },
    select: { publicId: true },
  });
  const existingOkIds = new Set(
    existingPhotos.map((p) => p.publicId.split("-")[1])
  );

  // Also track by title+wilaya to catch duplicates even if re-posted with new OK id
  const existingListings = await prisma.listing.findMany({
    where: { userId: scrapeUser.id },
    select: { title: true, wilayaCode: true },
  });
  const existingTitleKeys = new Set(
    existingListings.map((l) => `${l.title}::${l.wilayaCode}`)
  );

  console.log(`Found ${existingOkIds.size} existing OuedKniss IDs in DB`);
  console.log(`Found ${existingTitleKeys.size} existing title+wilaya combos`);

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (let page = 1; page <= PAGES_TO_SCRAPE; page++) {
    try {
      console.log(`\nFetching page ${page}/${PAGES_TO_SCRAPE}...`);
      const { data, total } = await fetchPage(page);

      if (page === 1) {
        console.log(`Total listings available: ${total}`);
      }

      for (const item of data) {
        try {
          // Skip if already imported (check by OuedKniss ID)
          if (existingOkIds.has(item.id)) {
            totalSkipped++;
            continue;
          }

          // Skip listings without images
          if (!item.medias || item.medias.length === 0) {
            totalSkipped++;
            continue;
          }

          // Skip listings with "Cherche" (looking for) — these are demands, not offers
          if (item.title.startsWith("Cherche")) {
            totalSkipped++;
            continue;
          }

          // Map categories
          const categorySlugs = item.categories.map((c) => c.slug);
          const { transactionType, propertyType } = mapCategory(categorySlugs);

          // Wilaya code from region
          const city = item.cities[0];
          if (!city) {
            totalSkipped++;
            continue;
          }
          const wilayaCode = parseInt(city.region.id);
          if (!validWilayaCodes.has(wilayaCode)) {
            totalSkipped++;
            continue;
          }

          // Skip duplicate by title+wilaya
          const titleKey = `${item.title}::${wilayaCode}`;
          if (existingTitleKeys.has(titleKey)) {
            totalSkipped++;
            continue;
          }

          // Price — skip if null and it's a sale (too important)
          const price = item.price;
          if (price === null || price === 0) {
            totalSkipped++;
            continue;
          }

          // Parse details from title & description
          const rooms = parseRooms(item.title);
          const surface = parseSurface(item.title + " " + item.description);
          const bedrooms = estimateBedrooms(rooms);

          // Coordinates with some randomness
          const baseCoords = wilayaCoords[wilayaCode] || { lat: 36.75, lng: 3.05 };
          const lat = baseCoords.lat + (Math.random() - 0.5) * 0.02;
          const lng = baseCoords.lng + (Math.random() - 0.5) * 0.02;

          // Parse features from description
          const descLower = (item.description || "").toLowerCase();
          const hasElevator = /ascenseur/i.test(descLower);
          const hasParking = /parking|garage/i.test(descLower);
          const hasGarden = /jardin/i.test(descLower);
          const hasPool = /piscine/i.test(descLower);
          const isFurnished = /meubl[ée]/i.test(descLower);

          // Try to match quartier from city name (OuedKniss cities are often quartier names)
          let quartierId: string | null = null;
          if (WILAYAS_WITH_QUARTIERS.has(wilayaCode)) {
            const cityNameLower = city.name.toLowerCase();
            const key = `${cityNameLower}-${wilayaCode}`;
            quartierId = quartierMap.get(key) ?? null;
          }

          // Create listing
          const listing = await prisma.listing.create({
            data: {
              title: item.title,
              description: item.description || "Annonce importée depuis OuedKniss",
              price,
              transactionType: transactionType as any,
              propertyType: propertyType as any,
              status: "ACTIVE",
              wilayaCode,
              commune: city.name,
              quartierId,
              surface,
              rooms,
              bedrooms,
              bathrooms: rooms && rooms >= 3 ? Math.max(1, Math.floor(rooms / 2)) : 1,
              latitude: lat,
              longitude: lng,
              hasElevator,
              hasParking,
              hasGarden,
              hasPool,
              isFurnished,
              userId: scrapeUser.id,
            },
          });

          // Add photos (max 5 per listing to keep storage reasonable)
          const photos = item.medias.slice(0, 5);
          for (let i = 0; i < photos.length; i++) {
            await prisma.listingPhoto.create({
              data: {
                listingId: listing.id,
                url: photos[i].mediaUrl,
                publicId: `ouedkniss-${item.id}-${i}`,
                category: "OTHER",
                order: i,
              },
            });
          }

          existingOkIds.add(item.id);
          existingTitleKeys.add(titleKey);
          totalInserted++;

          if (totalInserted % 10 === 0) {
            console.log(`  -> ${totalInserted} listings inserted so far...`);
          }
        } catch (err) {
          totalErrors++;
          console.warn(`  Warning: failed to insert "${item.title}": ${err}`);
        }
      }

      // Polite delay
      if (page < PAGES_TO_SCRAPE) {
        await sleep(DELAY_MS);
      }
    } catch (err) {
      console.error(`Error fetching page ${page}:`, err);
      // Continue with next page
    }
  }

  console.log(`\n=== Scraping complete ===`);
  console.log(`Inserted: ${totalInserted}`);
  console.log(`Skipped:  ${totalSkipped}`);
  console.log(`Errors:   ${totalErrors}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
