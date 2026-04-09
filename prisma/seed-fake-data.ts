import { PrismaClient, Currency, TransactionType, PropertyType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Data pour générer des annonces variées
const listings = [
  // ALGER (16)
  {
    title: "Appartement T3 Alger Centre lumineux",
    description: "Appartement spacieux bien situé avec vue sur la baie",
    price: 15000000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "APARTMENT" as PropertyType,
    wilayaCode: 16,
    lng: 3.0588,
    lat: 36.7372,
    surface: 120,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    address: "Rue Didouche Mourad, Alger Centre",
    hasParking: true,
  },
  {
    title: "Villa moderne Ben Aknoun 350m²",
    description: "Villa neuve avec piscine, jardin privatif, parking couvert",
    price: 450000,
    currency: "EUR" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "VILLA" as PropertyType,
    wilayaCode: 16,
    lng: 3.0459,
    lat: 36.7479,
    surface: 350,
    rooms: 5,
    bedrooms: 4,
    bathrooms: 3,
    address: "Ben Aknoun, Alger",
    hasElevator: true,
    hasParking: true,
    hasPool: true,
    hasGarden: true,
  },
  {
    title: "Studio meublé Hydra étudiant",
    description: "Studio T1 meublé, parfait pour étudiant ou jeune couple",
    price: 800000,
    currency: "DZA" as Currency,
    transactionType: "RENT" as TransactionType,
    propertyType: "STUDIO" as PropertyType,
    wilayaCode: 16,
    lng: 3.0352,
    lat: 36.7428,
    surface: 35,
    rooms: 1,
    bedrooms: 1,
    bathrooms: 1,
    address: "Hydra, Alger",
    isFurnished: true,
  },
  {
    title: "Terrain viabilisé Souidania constructible",
    description: "Terrain 800m² viabilisé, électricité, eau, proche routes",
    price: 8500000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "LAND" as PropertyType,
    wilayaCode: 16,
    lng: 3.0146,
    lat: 36.7215,
    surface: 800,
    rooms: 0,
    bedrooms: 0,
    bathrooms: 0,
    address: "Souidania, Alger",
  },
  {
    title: "T2 Bab El Oued avec balcon",
    description: "Appartement T2 rénové, balcon exposé sud, calme",
    price: 9500000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "APARTMENT" as PropertyType,
    wilayaCode: 16,
    lng: 3.0678,
    lat: 36.7512,
    surface: 85,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    address: "Bab El Oued, Alger",
  },
  {
    title: "Maison Kouba avec jardin 250m²",
    description: "Maison individuelle, jardin aménagé, garage, parking",
    price: 350000,
    currency: "EUR" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "HOUSE" as PropertyType,
    wilayaCode: 16,
    lng: 3.0234,
    lat: 36.7089,
    surface: 250,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 2,
    address: "Kouba, Alger",
    hasGarden: true,
    hasParking: true,
  },
  {
    title: "Bureau commercial Cheikh Zaid",
    description: "Bureau 150m² au premier étage, accès facile, parking",
    price: 2500000,
    currency: "DZA" as Currency,
    transactionType: "RENT" as TransactionType,
    propertyType: "OFFICE" as PropertyType,
    wilayaCode: 16,
    lng: 3.0845,
    lat: 36.7402,
    surface: 150,
    rooms: 3,
    bathrooms: 1,
    address: "Cheikh Zaid, Alger",
  },
  {
    title: "T4 Bir El Djinn balcon vue mer",
    description: "Appartement T4 avec balcon, vue panoramique sur la baie",
    price: 22000000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "APARTMENT" as PropertyType,
    wilayaCode: 16,
    lng: 3.0125,
    lat: 36.7289,
    surface: 160,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 2,
    address: "Bir El Djinn, Alger",
    hasElevator: true,
  },

  // ORAN (31)
  {
    title: "Appartement Oran front de mer",
    description: "Magnifique vue sur la baie d'Oran, immeuble moderne",
    price: 12000000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "APARTMENT" as PropertyType,
    wilayaCode: 31,
    lng: -0.6333,
    lat: 35.6969,
    surface: 95,
    rooms: 2,
    bedrooms: 2,
    bathrooms: 1,
    address: "Front de Mer, Oran",
  },
  {
    title: "Villa Oran Bir El Djir avec piscine",
    description: "Villa 300m² avec piscine, jardin, garage double",
    price: 280000,
    currency: "EUR" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "VILLA" as PropertyType,
    wilayaCode: 31,
    lng: -0.6156,
    lat: 35.6789,
    surface: 300,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 2,
    address: "Bir El Djir, Oran",
    hasPool: true,
    hasGarden: true,
    hasParking: true,
  },
  {
    title: "T1 meublé Es Senia location",
    description: "Studio meublé, proximité aéroport, idéal expatrié",
    price: 600000,
    currency: "DZA" as Currency,
    transactionType: "RENT" as TransactionType,
    propertyType: "APARTMENT" as PropertyType,
    wilayaCode: 31,
    lng: -0.5876,
    lat: 35.6234,
    surface: 40,
    rooms: 1,
    bedrooms: 1,
    bathrooms: 1,
    address: "Es Senia, Oran",
    isFurnished: true,
  },

  // CONSTANTINE (25)
  {
    title: "Penthouse Constantine vue gorges",
    description: "Penthouse de luxe, vue imprenable sur les gorges",
    price: 18000000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "APARTMENT" as PropertyType,
    wilayaCode: 25,
    lng: 6.6133,
    lat: 36.3741,
    surface: 140,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 2,
    address: "Cité Aïn Smara, Constantine",
    hasElevator: true,
  },
  {
    title: "Maison traditionnelle Medina Constantine",
    description: "Belle maison traditionnelle rénovée, cour intérieure",
    price: 150000,
    currency: "EUR" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "HOUSE" as PropertyType,
    wilayaCode: 25,
    lng: 6.6291,
    lat: 36.3668,
    surface: 180,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 1,
    address: "Medina Constantine",
  },

  // TLEMCEN (13)
  {
    title: "Terrain agricole Tlemcen",
    description: "Terrain 1.5 hectare viabilisé, routes d'accès",
    price: 5000000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "LAND" as PropertyType,
    wilayaCode: 13,
    lng: -1.3198,
    lat: 35.2964,
    surface: 15000,
    address: "Tlemcen",
  },

  // ANNABA (23)
  {
    title: "Appartement Annaba bord de mer",
    description: "T2 face à la mer, plage accessible à pied",
    price: 11000000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "APARTMENT" as PropertyType,
    wilayaCode: 23,
    lng: 7.7597,
    lat: 36.9018,
    surface: 80,
    rooms: 2,
    bedrooms: 2,
    bathrooms: 1,
    address: "Annaba Bord Mer",
  },

  // SETIF (19)
  {
    title: "Villa moderne Sétif Aïn Oulmène",
    description: "Villa neuve, architecture contemporaine, 4 chambres",
    price: 180000,
    currency: "EUR" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "VILLA" as PropertyType,
    wilayaCode: 19,
    lng: 5.4044,
    lat: 36.2056,
    surface: 280,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 2,
    address: "Aïn Oulmène, Sétif",
    hasParking: true,
  },

  // BLIDA (9)
  {
    title: "Terrain Blida périphérie",
    description: "500m² viabilisé, proche centre-ville",
    price: 4000000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "LAND" as PropertyType,
    wilayaCode: 9,
    lng: 2.8285,
    lat: 36.4774,
    surface: 500,
    address: "Blida",
  },
  {
    title: "Maison traditionnelle Blida",
    description: "Maison ancienne 200m² à rénover, terrain 800m²",
    price: 120000,
    currency: "EUR" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "HOUSE" as PropertyType,
    wilayaCode: 9,
    lng: 2.8456,
    lat: 36.4689,
    surface: 200,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 1,
    address: "Centre Blida",
  },

  // SKIKDA (21)
  {
    title: "Appartement Skikda port",
    description: "T3 avec balcon face port, calme et sécurisé",
    price: 8500000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "APARTMENT" as PropertyType,
    wilayaCode: 21,
    lng: 7.1391,
    lat: 36.8761,
    surface: 100,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    address: "Skikda Port",
  },

  // BATNA (5)
  {
    title: "T4 Batna Bouakal neuf",
    description: "Appartement T4 neuf, immeuble moderne, ascenseur",
    price: 7500000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "APARTMENT" as PropertyType,
    wilayaCode: 5,
    lng: 5.1809,
    lat: 35.5637,
    surface: 130,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 2,
    address: "Bouakal, Batna",
    hasElevator: true,
  },

  // TIZI OUZOU (15)
  {
    title: "Villa Tizi Ouzou à la montagne",
    description: "Villa 200m² calme, vue montagne, terrasse panoramique",
    price: 160000,
    currency: "EUR" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "VILLA" as PropertyType,
    wilayaCode: 15,
    lng: 4.0642,
    lat: 36.7167,
    surface: 200,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    address: "Tizi Ouzou",
  },

  // GUELMA (24)
  {
    title: "Maison Guelma centre-ville",
    description: "Maison 150m², centre historique, accès facile",
    price: 4500000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "HOUSE" as PropertyType,
    wilayaCode: 24,
    lng: 7.4612,
    lat: 36.4662,
    surface: 150,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    address: "Centre Guelma",
  },

  // MOSTAGANEM (27)
  {
    title: "Terrain Mostaganem bord mer",
    description: "2000m² en bord de mer, viabilisé, opportunité rare",
    price: 12000000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "LAND" as PropertyType,
    wilayaCode: 27,
    lng: 0.0886,
    lat: 35.9356,
    surface: 2000,
    address: "Bord Mer, Mostaganem",
  },

  // BEJAIA (6)
  {
    title: "Appartement Béjaïa vue mer",
    description: "T2 avec terrasse, vue sur la méditerranée, moderne",
    price: 10000000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "APARTMENT" as PropertyType,
    wilayaCode: 6,
    lng: 5.0842,
    lat: 36.7567,
    surface: 85,
    rooms: 2,
    bedrooms: 2,
    bathrooms: 1,
    address: "Béjaïa Centre",
  },

  // GHARDAIA (47)
  {
    title: "Maison traditionnelle Ghardaïa",
    description: "Maison typique, cour intérieure, architecture locale",
    price: 3500000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "HOUSE" as PropertyType,
    wilayaCode: 47,
    lng: 3.8837,
    lat: 32.4904,
    surface: 120,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    address: "Ghardaïa Médina",
  },

  // OUARGLA (30)
  {
    title: "Villa Ouargla climatisée",
    description: "Villa 220m² adaptée climat désert, climatisation",
    price: 140000,
    currency: "EUR" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "VILLA" as PropertyType,
    wilayaCode: 30,
    lng: 5.3269,
    lat: 31.9306,
    surface: 220,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    address: "Ouargla",
  },

  // TIARET (14)
  {
    title: "Terrain agricole Tiaret",
    description: "3 hectares terrain agricole, eau, électricité",
    price: 8000000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "LAND" as PropertyType,
    wilayaCode: 14,
    lng: 1.3172,
    lat: 35.3742,
    surface: 30000,
    address: "Tiaret",
  },

  // LAGHOUAT (3)
  {
    title: "Appartement Laghouat moderne",
    description: "T3 immeuble neuf, confort moderne, sécurité 24/24",
    price: 5500000,
    currency: "DZA" as Currency,
    transactionType: "SALE" as TransactionType,
    propertyType: "APARTMENT" as PropertyType,
    wilayaCode: 3,
    lng: 2.8868,
    lat: 33.8006,
    surface: 105,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    address: "Centre Laghouat",
  },
];

async function main() {
  console.log("🌱 Seeding fake data...");

  // 1. Créer utilisateurs test
  console.log("👤 Creating test users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "ahmed@test.com" },
    update: {},
    create: {
      email: "ahmed@test.com",
      name: "Ahmed Ben Ali",
      password: hashedPassword,
      role: "USER",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "fatima@test.com" },
    update: {},
    create: {
      email: "fatima@test.com",
      name: "Fatima Mansouri",
      password: hashedPassword,
      role: "USER",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "malik@test.com" },
    update: {},
    create: {
      email: "malik@test.com",
      name: "Malik Saïdi",
      password: hashedPassword,
      role: "USER",
    },
  });

  const director = await prisma.user.upsert({
    where: { email: "director@immoagency.com" },
    update: {},
    create: {
      email: "director@immoagency.com",
      name: "Karim Benali",
      password: hashedPassword,
      role: "AGENCY_DIRECTOR",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@immodz.com" },
    update: {},
    create: {
      email: "admin@immodz.com",
      name: "Admin ImmoDz",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Created ${5} users`);

  // 2. Créer agences
  console.log("🏢 Creating test agencies...");

  const agency1 = await prisma.agency.upsert({
    where: { directorId: director.id },
    update: {},
    create: {
      name: "ImmoLuxe Algérie",
      description: "Agence immobilière premium à Alger",
      directorId: director.id,
      phone: "+213 21 123 4567",
      email: "contact@immoluxe.com",
      wilayaCode: 16,
    },
  });

  console.log(`✅ Created 1 agency`);

  // 3. Créer annonces
  console.log("🏠 Creating test listings...");

  let count = 0;
  for (const listingData of listings) {
    const { lng, lat, ...createData } = listingData;

    // Alterner entre users et agency
    const isAgency = count % 3 === 2;
    const userId = isAgency
      ? director.id
      : [user1.id, user2.id, user3.id][count % 3];
    const agencyId = isAgency ? agency1.id : null;

    await prisma.listing.upsert({
      where: { id: `listing-${count}` },
      update: {},
      create: {
        ...createData,
        id: `listing-${count}`,
        userId,
        agencyId,
        // Location PostGIS (format WKT)
        location: `SRID=4326;POINT(${lng} ${lat})`,
      } as any,
    });

    count++;
  }

  console.log(`✅ Created ${listings.length} listings`);

  // Stats
  const activeDZA = listings.filter((l) => l.currency === "DZA").length;
  const activeEUR = listings.filter((l) => l.currency === "EUR").length;
  const rentals = listings.filter((l) => l.transactionType === "RENT").length;
  const sales = listings.filter((l) => l.transactionType === "SALE").length;

  console.log("\n✨ Seeding complete!");
  console.log(`\n📊 Statistiques:`);
  console.log(`   Total annonces: ${listings.length}`);
  console.log(`   En DZA: ${activeDZA}`);
  console.log(`   En EUR: ${activeEUR}`);
  console.log(`   À louer: ${rentals}`);
  console.log(`   À vendre: ${sales}`);

  console.log("\n📝 Test credentials:");
  console.log("   USER:     ahmed@test.com / password123");
  console.log("   USER:     fatima@test.com / password123");
  console.log("   USER:     malik@test.com / password123");
  console.log("   DIRECTOR: director@immoagency.com / password123");
  console.log("   ADMIN:    admin@immodz.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
