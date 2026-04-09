import * as fs from "fs";
import * as path from "path";

// ─── Config ──────────────────────────────────────────────
const GRAPHQL_URL = "https://api.ouedkniss.com/graphql";
const DELAY_MS = 600;
const OUTPUT_FILE = path.join(process.cwd(), "prisma", "scraped-listings.csv");

// ─── Grosses villes prioritaires ────────────────────────
const BIG_CITIES: [number, number, string][] = [
  [16, 15, "Alger"],
  [31, 12, "Oran"],
  [25, 10, "Constantine"],
  [23, 8, "Annaba"],
  [19, 8, "Sétif"],
  [9, 8, "Blida"],
  [15, 7, "Tizi Ouzou"],
  [6, 7, "Béjaïa"],
  [5, 6, "Batna"],
  [35, 6, "Boumerdès"],
  [42, 6, "Tipaza"],
  [26, 5, "Médéa"],
  [34, 5, "Bordj Bou Arréridj"],
  [43, 5, "Mila"],
  [41, 5, "Souk Ahras"],
  [36, 5, "El Tarf"],
  [18, 4, "Jijel"],
  [21, 4, "Skikda"],
  [38, 4, "Tissemsilt"],
  [2, 4, "Chlef"],
  [22, 4, "Sidi Bel Abbès"],
  [13, 4, "Tlemcen"],
  [40, 4, "Khenchela"],
  [28, 3, "M'Sila"],
  [10, 3, "Bouira"],
  [14, 3, "Tiaret"],
];

const wilayaCoords: Record<number, { lat: number; lng: number }> = {
  1: { lat: 27.8742, lng: -0.2939 }, 2: { lat: 36.165, lng: 1.3346 },
  3: { lat: 33.8, lng: 2.865 }, 4: { lat: 35.8756, lng: 7.1097 },
  5: { lat: 35.5619, lng: 6.1745 }, 6: { lat: 36.7508, lng: 5.0567 },
  7: { lat: 34.848, lng: 5.7286 }, 8: { lat: 31.6167, lng: -2.2167 },
  9: { lat: 36.4699, lng: 2.8277 }, 10: { lat: 36.3729, lng: 3.9003 },
  11: { lat: 22.785, lng: 5.5228 }, 12: { lat: 35.4042, lng: 8.1244 },
  13: { lat: 34.878, lng: -1.315 }, 14: { lat: 35.371, lng: 1.315 },
  15: { lat: 36.7155, lng: 4.2559 }, 16: { lat: 36.737, lng: 3.0588 },
  17: { lat: 34.6704, lng: 3.25 }, 18: { lat: 36.8206, lng: 5.7667 },
  19: { lat: 36.1899, lng: 5.3669 }, 20: { lat: 34.83, lng: 0.1525 },
  21: { lat: 36.8667, lng: 6.9 }, 22: { lat: 35.1897, lng: -0.6308 },
  23: { lat: 36.906, lng: 7.1663 }, 24: { lat: 36.4617, lng: 7.4264 },
  25: { lat: 36.3791, lng: 6.6145 }, 26: { lat: 36.2675, lng: 2.75 },
  27: { lat: 35.9311, lng: 0.0892 }, 28: { lat: 35.7053, lng: 4.5425 },
  29: { lat: 35.3975, lng: 0.1403 }, 30: { lat: 31.9497, lng: 5.325 },
  31: { lat: 35.6953, lng: -0.6435 }, 32: { lat: 33.6833, lng: 1.0167 },
  33: { lat: 26.5089, lng: 8.4811 }, 34: { lat: 36.0686, lng: 4.7628 },
  35: { lat: 36.5244, lng: 3.4822 }, 36: { lat: 36.7669, lng: 8.3136 },
  37: { lat: 27.6742, lng: -8.1478 }, 38: { lat: 35.6072, lng: 1.8106 },
  39: { lat: 33.3683, lng: 6.8673 }, 40: { lat: 35.4358, lng: 7.1417 },
  41: { lat: 36.2861, lng: 7.9511 }, 42: { lat: 36.5894, lng: 2.4472 },
  43: { lat: 36.4508, lng: 6.2644 }, 44: { lat: 36.264, lng: 1.968 },
  45: { lat: 33.2667, lng: -0.3167 }, 46: { lat: 35.2972, lng: -1.1403 },
  47: { lat: 32.4903, lng: 3.6736 }, 48: { lat: 35.7375, lng: 0.5567 },
  49: { lat: 33.95, lng: 5.917 }, 50: { lat: 30.5833, lng: 2.8833 },
  51: { lat: 34.4333, lng: 5.0667 }, 52: { lat: 21.3333, lng: 0.95 },
  53: { lat: 30.1333, lng: -2.1667 }, 54: { lat: 29.2639, lng: 0.23 },
  55: { lat: 33.1, lng: 6.0667 }, 56: { lat: 24.555, lng: 9.4853 },
  57: { lat: 27.1939, lng: 2.4731 }, 58: { lat: 19.5667, lng: 5.7667 },
};

function mapCategory(slugs: string[]): { transactionType: string; propertyType: string } {
  const transactionType = slugs.some((s) => s.includes("location")) ? "RENT" : "SALE";
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

function parseRooms(title: string): number | null {
  const match = title.match(/\bF(\d)\b/i);
  return match ? parseInt(match[1]) : null;
}

function parseSurface(text: string): number | null {
  const match = text.match(/(\d{2,4})\s*(?:m²|m2|metre|mètre)/i);
  return match ? parseInt(match[1]) : null;
}

function csvEscape(val: string | number | null | boolean): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const SEARCH_QUERY = `
  query SearchImmobilier($page: Int, $regionIds: [ID]) {
    search(filter: { categorySlug: "immobilier", page: $page, regionIds: $regionIds }) {
      announcements {
        data {
          id title description price priceUnit priceType
          categories { slug name }
          defaultMedia { mediaUrl }
          cities { name region { id name } }
          medias { mediaUrl }
        }
        paginatorInfo { currentPage lastPage total }
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

async function fetchPage(page: number, regionId: number): Promise<{ data: OKAnnouncement[]; lastPage: number; total: number }> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: SEARCH_QUERY, variables: { page, regionIds: [regionId] } }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors)}`);
  const { data, paginatorInfo } = json.data.search.announcements;
  return { data, lastPage: paginatorInfo.lastPage, total: paginatorInfo.total };
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

const CSV_HEADERS = [
  "ok_id", "title", "description", "price", "transaction_type", "property_type",
  "wilaya_code", "wilaya_name", "commune", "latitude", "longitude",
  "surface", "rooms", "bedrooms", "bathrooms",
  "has_elevator", "has_parking", "has_garden", "has_pool", "is_furnished",
  "photos", // pipe-separated URLs
];

async function main() {
  console.log("=== OuedKniss → CSV Scraper ===\n");

  // Init CSV file
  const writeStream = fs.createWriteStream(OUTPUT_FILE, { encoding: "utf8" });
  writeStream.write(CSV_HEADERS.join(",") + "\n");

  // Track duplicates in memory
  const seenIds = new Set<string>();
  const seenTitleKeys = new Set<string>();

  // If file already exists with data, reload existing IDs to avoid re-scraping
  if (fs.existsSync(OUTPUT_FILE + ".bak")) {
    const existing = fs.readFileSync(OUTPUT_FILE + ".bak", "utf8").split("\n").slice(1);
    for (const line of existing) {
      if (!line.trim()) continue;
      const id = line.split(",")[0];
      if (id) seenIds.add(id);
    }
    console.log(`Reprise: ${seenIds.size} IDs déjà scrapés\n`);
  }

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const [wilayaCode, maxPages, cityName] of BIG_CITIES) {
    console.log(`\n─── ${cityName} (wilaya ${wilayaCode}, ${maxPages} pages) ───`);
    const baseCoords = wilayaCoords[wilayaCode] || { lat: 36.75, lng: 3.05 };

    for (let page = 1; page <= maxPages; page++) {
      try {
        process.stdout.write(`  Page ${page}/${maxPages}... `);
        const { data, lastPage, total } = await fetchPage(page, wilayaCode);

        if (page === 1) console.log(`(total: ${total}, lastPage: ${lastPage})`);
        else console.log(`(${data.length} annonces)`);

        if (page > lastPage) break;

        for (const item of data) {
          // Skip already seen
          if (seenIds.has(item.id)) { totalSkipped++; continue; }

          // Skip without photos
          if (!item.medias || item.medias.length === 0) { totalSkipped++; continue; }

          // Skip demandes
          if (/^cherche\b/i.test(item.title)) { totalSkipped++; continue; }

          // Skip no price
          if (!item.price || item.price === 0) { totalSkipped++; continue; }

          const city = item.cities[0];
          if (!city) { totalSkipped++; continue; }

          const wilayaId = parseInt(city.region.id);
          const titleKey = `${item.title}::${wilayaId}`;
          if (seenTitleKeys.has(titleKey)) { totalSkipped++; continue; }

          const { transactionType, propertyType } = mapCategory(item.categories.map((c) => c.slug));
          const rooms = parseRooms(item.title);
          const surface = parseSurface(item.title + " " + (item.description || ""));
          const lat = baseCoords.lat + (Math.random() - 0.5) * 0.04;
          const lng = baseCoords.lng + (Math.random() - 0.5) * 0.04;
          const desc = (item.description || "").toLowerCase();

          const row = [
            item.id,
            item.title,
            (item.description || "Annonce importée depuis OuedKniss").replace(/\n/g, " "),
            item.price,
            transactionType,
            propertyType,
            wilayaId,
            city.region.name,
            city.name,
            lat.toFixed(6),
            lng.toFixed(6),
            surface ?? "",
            rooms ?? "",
            rooms ? (rooms <= 1 ? 1 : rooms - 1) : "",
            rooms && rooms >= 3 ? Math.max(1, Math.floor(rooms / 2)) : 1,
            /ascenseur/i.test(desc) ? 1 : 0,
            /parking|garage/i.test(desc) ? 1 : 0,
            /jardin/i.test(desc) ? 1 : 0,
            /piscine/i.test(desc) ? 1 : 0,
            /meubl[ée]/i.test(desc) ? 1 : 0,
            item.medias.slice(0, 5).map((m) => m.mediaUrl).join("|"),
          ].map(csvEscape).join(",");

          writeStream.write(row + "\n");
          seenIds.add(item.id);
          seenTitleKeys.add(titleKey);
          totalInserted++;
        }

        if (page < maxPages) await sleep(DELAY_MS);
      } catch (err) {
        console.error(`  Erreur page ${page}:`, err);
      }
    }

    console.log(`  → Insérées: ${totalInserted} total | Ignorées: ${totalSkipped} total`);
    await sleep(800);
  }

  writeStream.end();
  console.log(`\n${"═".repeat(50)}`);
  console.log(`Scraping terminé`);
  console.log(`Annonces scrapées : ${totalInserted}`);
  console.log(`Ignorées          : ${totalSkipped}`);
  console.log(`Fichier           : ${OUTPUT_FILE}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
