import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Coordonnées GPS réelles pour les principales villes algériennes
const cityCoords: Record<number, { lat: number; lng: number }> = {
  16: { lat: 36.737, lng: 3.0588 }, // Alger
  31: { lat: 35.6953, lng: -0.6435 }, // Oran
  25: { lat: 36.3791, lng: 6.6145 }, // Constantine
  23: { lat: 36.906, lng: 7.1663 }, // Annaba
  19: { lat: 36.1899, lng: 5.3669 }, // Sétif
  15: { lat: 36.7155, lng: 4.2559 }, // Tizi Ouzou
  9: { lat: 36.4699, lng: 2.8277 }, // Blida
  35: { lat: 36.5244, lng: 3.4822 }, // Boumerdès
  5: { lat: 35.5619, lng: 6.1745 }, // Batna
};

const wilayas = [
  { code: 1, name: "Adrar", nameAr: "أدرار" },
  { code: 2, name: "Chlef", nameAr: "الشلف" },
  { code: 3, name: "Laghouat", nameAr: "الأغواط" },
  { code: 4, name: "Oum El Bouaghi", nameAr: "أم البواقي" },
  { code: 5, name: "Batna", nameAr: "باتنة" },
  { code: 6, name: "Béjaïa", nameAr: "بجاية" },
  { code: 7, name: "Biskra", nameAr: "بسكرة" },
  { code: 8, name: "Béchar", nameAr: "بشار" },
  { code: 9, name: "Blida", nameAr: "البليدة" },
  { code: 10, name: "Bouira", nameAr: "البويرة" },
  { code: 11, name: "Tamanrasset", nameAr: "تمنراست" },
  { code: 12, name: "Tébessa", nameAr: "تبسة" },
  { code: 13, name: "Tlemcen", nameAr: "تلمسان" },
  { code: 14, name: "Tiaret", nameAr: "تيارت" },
  { code: 15, name: "Tizi Ouzou", nameAr: "تيزي وزو" },
  { code: 16, name: "Alger", nameAr: "الجزائر" },
  { code: 17, name: "Djelfa", nameAr: "الجلفة" },
  { code: 18, name: "Jijel", nameAr: "جيجل" },
  { code: 19, name: "Sétif", nameAr: "سطيف" },
  { code: 20, name: "Saïda", nameAr: "سعيدة" },
  { code: 21, name: "Skikda", nameAr: "سكيكدة" },
  { code: 22, name: "Sidi Bel Abbès", nameAr: "سيدي بلعباس" },
  { code: 23, name: "Annaba", nameAr: "عنابة" },
  { code: 24, name: "Guelma", nameAr: "قالمة" },
  { code: 25, name: "Constantine", nameAr: "قسنطينة" },
  { code: 26, name: "Médéa", nameAr: "المدية" },
  { code: 27, name: "Mostaganem", nameAr: "مستغانم" },
  { code: 28, name: "M'Sila", nameAr: "المسيلة" },
  { code: 29, name: "Mascara", nameAr: "معسكر" },
  { code: 30, name: "Ouargla", nameAr: "ورقلة" },
  { code: 31, name: "Oran", nameAr: "وهران" },
  { code: 32, name: "El Bayadh", nameAr: "البيض" },
  { code: 33, name: "Illizi", nameAr: "إليزي" },
  { code: 34, name: "Bordj Bou Arréridj", nameAr: "برج بوعريريج" },
  { code: 35, name: "Boumerdès", nameAr: "بومرداس" },
  { code: 36, name: "El Tarf", nameAr: "الطارف" },
  { code: 37, name: "Tindouf", nameAr: "تندوف" },
  { code: 38, name: "Tissemsilt", nameAr: "تيسمسيلت" },
  { code: 39, name: "El Oued", nameAr: "الوادي" },
  { code: 40, name: "Khenchela", nameAr: "خنشلة" },
  { code: 41, name: "Souk Ahras", nameAr: "سوق أهراس" },
  { code: 42, name: "Tipaza", nameAr: "تيبازة" },
  { code: 43, name: "Mila", nameAr: "ميلة" },
  { code: 44, name: "Aïn Defla", nameAr: "عين الدفلى" },
  { code: 45, name: "Naâma", nameAr: "النعامة" },
  { code: 46, name: "Aïn Témouchent", nameAr: "عين تموشنت" },
  { code: 47, name: "Ghardaïa", nameAr: "غرداية" },
  { code: 48, name: "Relizane", nameAr: "غليزان" },
  { code: 49, name: "El M'Ghair", nameAr: "المغير" },
  { code: 50, name: "El Meniaa", nameAr: "المنيعة" },
  { code: 51, name: "Ouled Djellal", nameAr: "أولاد جلال" },
  { code: 52, name: "Bordj Badji Mokhtar", nameAr: "برج باجي مختار" },
  { code: 53, name: "Béni Abbès", nameAr: "بني عباس" },
  { code: 54, name: "Timimoun", nameAr: "تيميمون" },
  { code: 55, name: "Touggourt", nameAr: "تقرت" },
  { code: 56, name: "Djanet", nameAr: "جانت" },
  { code: 57, name: "In Salah", nameAr: "عين صالح" },
  { code: 58, name: "In Guezzam", nameAr: "عين قزام" },
];

async function main() {
  try {
    console.log("🌱 Seeding database...");

    // 1. Wilayas
    console.log("📍 Seeding wilayas...");
    for (const wilaya of wilayas) {
      await prisma.wilaya.upsert({
        where: { code: wilaya.code },
        update: { name: wilaya.name, nameAr: wilaya.nameAr },
        create: wilaya,
      });
    }
    console.log(`✅ Seeded ${wilayas.length} wilayas.`);

    // 2. Users
    console.log("👥 Seeding users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const admin = await prisma.user.upsert({
      where: { email: "admin@immodz.local" },
      update: {},
      create: {
        email: "admin@immodz.local",
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    const director = await prisma.user.upsert({
      where: { email: "director@immodz.local" },
      update: {},
      create: {
        email: "director@immodz.local",
        name: "Karim Mansouri",
        password: hashedPassword,
        phone: "+213555123456",
        role: "AGENCY_DIRECTOR",
      },
    });

    const employee = await prisma.user.upsert({
      where: { email: "employee@immodz.local" },
      update: {},
      create: {
        email: "employee@immodz.local",
        name: "Fatima Benali",
        password: hashedPassword,
        phone: "+213555654321",
        role: "AGENCY_EMPLOYEE",
      },
    });

    const user1 = await prisma.user.upsert({
      where: { email: "user1@immodz.local" },
      update: {},
      create: {
        email: "user1@immodz.local",
        name: "Ahmed Sabet",
        password: hashedPassword,
        phone: "+213552111111",
        role: "USER",
      },
    });

    const user2 = await prisma.user.upsert({
      where: { email: "user2@immodz.local" },
      update: {},
      create: {
        email: "user2@immodz.local",
        name: "Lina Cherif",
        password: hashedPassword,
        phone: "+213552222222",
        role: "USER",
      },
    });

    console.log(`✅ Seeded 5 users.`);

    // 3. Agency
    console.log("🏢 Seeding agency...");
    const agency = await prisma.agency.upsert({
      where: { id: "agency-demo" },
      update: {},
      create: {
        id: "agency-demo",
        name: "Elite Immobilier Alger",
        description: "Agence immobilière leader en Algérie",
        phone: "+213770123456",
        email: "contact@elite.local",
        address: "123 Rue Didouche Mourad, Alger",
        wilayaCode: 16,
      },
    });

    // Add members
    await prisma.agencyMember.upsert({
      where: { userId_agencyId: { userId: director.id, agencyId: agency.id } },
      update: {},
      create: {
        userId: director.id,
        agencyId: agency.id,
        role: "AGENCY_DIRECTOR",
      },
    });

    await prisma.agencyMember.upsert({
      where: { userId_agencyId: { userId: employee.id, agencyId: agency.id } },
      update: {},
      create: {
        userId: employee.id,
        agencyId: agency.id,
        role: "AGENCY_EMPLOYEE",
      },
    });

    console.log(`✅ Seeded agency with members.`);

    // 4. Listings
    console.log("🏠 Seeding listings...");

    const listingsData = [
      {
        title: "Bel appartement 3 pièces - Alger centre",
        description:
          "Spacieux appartement rénové avec vue sur la baie. Proche transports, commerces.",
        price: 85000,
        transactionType: "RENT" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16,
        commune: "Alger",
        address: "Rue Didouche Mourad",
        surface: 110,
        rooms: 3,
        bedrooms: 2,
        bathrooms: 2,
        floor: 4,
        hasElevator: true,
        hasParking: true,
        isFurnished: false,
      },
      {
        title: "Villa moderne avec piscine - Oran",
        description:
          "Magnifique villa avec grand jardin, piscine chauffée, garage double.",
        price: 280000,
        transactionType: "SALE" as const,
        propertyType: "VILLA" as const,
        wilayaCode: 31,
        commune: "Oran",
        address: "Boulevard de Sidi Mabrouk",
        surface: 350,
        rooms: 5,
        bedrooms: 4,
        bathrooms: 3,
        floor: 1,
        hasElevator: false,
        hasParking: true,
        hasGarden: true,
        hasPool: true,
        isFurnished: true,
        yearBuilt: 2020,
      },
      {
        title: "Studio meublé - Constantine",
        description: "Petit studio confortable, tout équipé, près Université.",
        price: 22000,
        transactionType: "RENT" as const,
        propertyType: "STUDIO" as const,
        wilayaCode: 25,
        commune: "Constantine",
        address: "Rue Sidi Jimmah",
        surface: 35,
        rooms: 1,
        bedrooms: 1,
        bathrooms: 1,
        hasParking: false,
        isFurnished: true,
      },
      {
        title: "Maison traditionnelle - Blida",
        description: "Charmante maison avec jardin, bien entretenue.",
        price: 12500,
        transactionType: "RENT" as const,
        propertyType: "HOUSE" as const,
        wilayaCode: 9,
        commune: "Blida",
        address: "Quartier Talbaoui",
        surface: 180,
        rooms: 4,
        bedrooms: 3,
        bathrooms: 2,
        hasParking: true,
        hasGarden: true,
        yearBuilt: 2005,
      },
      {
        title: "Bureau commercial - Annaba",
        description: "Espace commercial idéal pour PME/PMI, parking privé.",
        price: 8500,
        transactionType: "RENT" as const,
        propertyType: "OFFICE" as const,
        wilayaCode: 23,
        commune: "Annaba",
        address: "Centre-ville",
        surface: 120,
        rooms: 3,
      },
      {
        title: "Terrain à bâtir - Sétif",
        description: "Terrain idéal pour construction, bien situé.",
        price: 35000,
        transactionType: "SALE" as const,
        propertyType: "LAND" as const,
        wilayaCode: 19,
        commune: "Sétif",
        address: "Route de Beni Ourtilane",
        surface: 800,
      },
      {
        title: "Appartement luxe Boumerdès",
        description:
          "Penthouse moderne, garage, balcon panoramique, clim réversible.",
        price: 145000,
        transactionType: "SALE" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 35,
        commune: "Boumerdès",
        address: "Boulevard front de mer",
        surface: 200,
        rooms: 4,
        bedrooms: 3,
        bathrooms: 2,
        floor: 12,
        hasElevator: true,
        hasParking: true,
        isFurnished: true,
        yearBuilt: 2022,
      },
      {
        title: "Garage - Tizi Ouzou",
        description: "Petit garage spacieux à louer pour véhicule.",
        price: 3500,
        transactionType: "RENT" as const,
        propertyType: "GARAGE" as const,
        wilayaCode: 15,
        commune: "Tizi Ouzou",
        address: "Rue principale",
        surface: 25,
      },
    ];

    for (const listingData of listingsData) {
      const coords = cityCoords[listingData.wilayaCode] || {
        lat: 36.75,
        lng: 3.0,
      };
      // Ajouter du bruit pour varier les coords
      const lat = coords.lat + (Math.random() - 0.5) * 0.05;
      const lng = coords.lng + (Math.random() - 0.5) * 0.05;

      await prisma.listing.create({
        data: {
          ...listingData,
          userId: [user1.id, user2.id, director.id][
            Math.floor(Math.random() * 3)
          ],
          status: "ACTIVE",
        },
      });
    }

    // Set PostGIS locations manually for listings (since Prisma doesn't support PostGIS natively)
    const listings = await prisma.listing.findMany({});
    for (const listing of listings) {
      const coords = cityCoords[listing.wilayaCode] || { lat: 36.75, lng: 3.0 };
      const lat = coords.lat + (Math.random() - 0.5) * 0.05;
      const lng = coords.lng + (Math.random() - 0.5) * 0.05;

      await prisma.$executeRawUnsafe(
        `UPDATE listings SET location = ST_GeogFromText('SRID=4326;POINT(${lng} ${lat})') WHERE id = '${listing.id}'`
      );
    }

    console.log(`✅ Seeded ${listingsData.length} listings.`);

    console.log("🎉 Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
