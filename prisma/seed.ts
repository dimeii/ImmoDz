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

// Coordonnées précises par quartier d'Alger
const algerQuartiers: Record<string, { lat: number; lng: number }> = {
  "Bab El Oued": { lat: 36.7925, lng: 3.0500 },
  "Casbah": { lat: 36.7855, lng: 3.0605 },
  "Hussein Dey": { lat: 36.7430, lng: 3.0980 },
  "Kouba": { lat: 36.7265, lng: 3.0835 },
  "El Biar": { lat: 36.7685, lng: 3.0305 },
  "Hydra": { lat: 36.7475, lng: 3.0245 },
  "Ben Aknoun": { lat: 36.7530, lng: 3.0110 },
  "Bir Mourad Rais": { lat: 36.7365, lng: 3.0460 },
  "Bouzareah": { lat: 36.7820, lng: 3.0170 },
  "Dely Ibrahim": { lat: 36.7535, lng: 2.9865 },
  "Draria": { lat: 36.7170, lng: 2.9685 },
  "Bab Ezzouar": { lat: 36.7190, lng: 3.1810 },
  "Bordj El Kiffan": { lat: 36.7480, lng: 3.1880 },
  "Dar El Beida": { lat: 36.7130, lng: 3.2125 },
  "Ain Benian": { lat: 36.8010, lng: 2.9255 },
  "Cheraga": { lat: 36.7670, lng: 2.9565 },
  "Staoueli": { lat: 36.7550, lng: 2.8910 },
  "Zeralda": { lat: 36.7110, lng: 2.8425 },
  "Rouiba": { lat: 36.7320, lng: 3.2730 },
  "Reghaia": { lat: 36.7365, lng: 3.3375 },
  "Sidi M'hamed": { lat: 36.7580, lng: 3.0580 },
  "El Harrach": { lat: 36.7220, lng: 3.1365 },
  "Mohammadia": { lat: 36.7345, lng: 3.1540 },
  "Bachdjerrah": { lat: 36.7190, lng: 3.1105 },
  "El Mouradia": { lat: 36.7530, lng: 3.0480 },
  "Alger centre": { lat: 36.7650, lng: 3.0590 },
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
        title: "Appartement 2 pièces lumineux - Bab El Oued",
        description:
          "Appartement bien orienté avec grande fenêtre, cuisine moderne.",
        price: 65000,
        transactionType: "RENT" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16,
        commune: "Alger",
        address: "Boulevard Bab El Oued",
        surface: 85,
        rooms: 2,
        bedrooms: 1,
        bathrooms: 1,
        floor: 3,
        hasElevator: true,
        hasParking: false,
        isFurnished: false,
      },
      {
        title: "Studio meublé Assi Youcef",
        description: "Studio entièrement meublé et équipé, prêt à emménager.",
        price: 45000,
        transactionType: "RENT" as const,
        propertyType: "STUDIO" as const,
        wilayaCode: 16,
        commune: "Alger",
        address: "Rue Assi Youcef",
        surface: 40,
        rooms: 1,
        bedrooms: 1,
        bathrooms: 1,
        floor: 2,
        hasElevator: false,
        hasParking: false,
        isFurnished: true,
      },
      {
        title: "Appartement 4 pièces Kouba - VENTE",
        description:
          "Spacieux 4 pièces, balcons, ascenseur, parking, proche métro.",
        price: 28500000,
        transactionType: "SALE" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16,
        commune: "Alger",
        address: "Quartier Kouba",
        surface: 145,
        rooms: 4,
        bedrooms: 3,
        bathrooms: 2,
        floor: 6,
        hasElevator: true,
        hasParking: true,
        isFurnished: false,
        yearBuilt: 2018,
      },
      {
        title: "Penthouse moderne Ben Aknoun",
        description:
          "Luxueux penthouse avec terrasse panoramique, clim réversible, vue sur la mer.",
        price: 150000,
        transactionType: "RENT" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16,
        commune: "Alger",
        address: "Chemin Ben Aknoun",
        surface: 200,
        rooms: 4,
        bedrooms: 3,
        bathrooms: 2,
        floor: 10,
        hasElevator: true,
        hasParking: true,
        isFurnished: true,
      },
      {
        title: "T2 refait à neuf - Sidi M'hamed",
        description:
          "Petit appartement rénové récemment, cuisine équipée, salle de bain neuve.",
        price: 55000,
        transactionType: "RENT" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16,
        commune: "Alger",
        address: "Rue Sidi M'hamed",
        surface: 65,
        rooms: 2,
        bedrooms: 1,
        bathrooms: 1,
        floor: 2,
        hasElevator: false,
        hasParking: false,
        isFurnished: false,
      },
      {
        title: "Appartement avec garage - Hussein Dey",
        description:
          "Confortable 3 pièces avec garage privé et petit balcon.",
        price: 90000,
        transactionType: "RENT" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16,
        commune: "Alger",
        address: "Boulevard Hussein Dey",
        surface: 120,
        rooms: 3,
        bedrooms: 2,
        bathrooms: 1,
        floor: 1,
        hasElevator: false,
        hasParking: true,
        isFurnished: false,
      },
      {
        title: "Villa avec jardin - Hydra",
        description:
          "Charmante villa résidentielle avec petit jardin arborisé et portail sécurisé.",
        price: 120000,
        transactionType: "RENT" as const,
        propertyType: "VILLA" as const,
        wilayaCode: 16,
        commune: "Alger",
        address: "Quartier Hydra",
        surface: 250,
        rooms: 4,
        bedrooms: 3,
        bathrooms: 2,
        floor: 1,
        hasElevator: false,
        hasParking: true,
        hasGarden: true,
        isFurnished: false,
      },
      {
        title: "Bureau avec parking - Algériens Musulmans",
        description:
          "Bureaux modernes en plein centre, climatisé, parking fermé.",
        price: 12000,
        transactionType: "RENT" as const,
        propertyType: "OFFICE" as const,
        wilayaCode: 16,
        commune: "Alger",
        address: "Boulevard Algériens Musulmans",
        surface: 110,
        rooms: 3,
      },
      {
        title: "T3 spacieux Bab Ezzouar",
        description:
          "Très spacieux 3 pièces, ascenseur, balcons, près commerces.",
        price: 75000,
        transactionType: "RENT" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16,
        commune: "Alger",
        address: "Boulevard Bab Ezzouar",
        surface: 135,
        rooms: 3,
        bedrooms: 2,
        bathrooms: 2,
        floor: 5,
        hasElevator: true,
        hasParking: false,
        isFurnished: false,
      },
      // ─── 20 annonces supplémentaires Alger ───
      {
        title: "F3 vue mer - Ain Benian",
        description: "Superbe F3 avec vue imprenable sur la Méditerranée, résidence sécurisée.",
        price: 95000,
        transactionType: "RENT" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16, commune: "Ain Benian", address: "Front de mer Ain Benian",
        surface: 100, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 7,
        hasElevator: true, hasParking: true, isFurnished: false,
      },
      {
        title: "Duplex familial - Cheraga",
        description: "Grand duplex dans quartier calme, idéal pour famille, proche école internationale.",
        price: 35000000,
        transactionType: "SALE" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16, commune: "Cheraga", address: "Cité Cheraga",
        surface: 180, rooms: 5, bedrooms: 4, bathrooms: 2, floor: 3,
        hasElevator: true, hasParking: true, isFurnished: false, yearBuilt: 2021,
      },
      {
        title: "Studio étudiant - Bab Ezzouar",
        description: "Studio meublé proche USTHB et centre commercial Bab Ezzouar.",
        price: 30000,
        transactionType: "RENT" as const,
        propertyType: "STUDIO" as const,
        wilayaCode: 16, commune: "Bab Ezzouar", address: "Cité AADL Bab Ezzouar",
        surface: 32, rooms: 1, bedrooms: 1, bathrooms: 1, floor: 4,
        hasElevator: true, hasParking: false, isFurnished: true,
      },
      {
        title: "Villa standing - Dely Ibrahim",
        description: "Villa de standing avec piscine, jardin paysager et double garage.",
        price: 65000000,
        transactionType: "SALE" as const,
        propertyType: "VILLA" as const,
        wilayaCode: 16, commune: "Dely Ibrahim", address: "Lotissement Dely Ibrahim",
        surface: 400, rooms: 6, bedrooms: 5, bathrooms: 3, floor: 1,
        hasElevator: false, hasParking: true, hasGarden: true, hasPool: true, yearBuilt: 2019,
      },
      {
        title: "F2 rénové - El Biar",
        description: "Appartement rénové dans immeuble haussmannien, parquet, moulures.",
        price: 70000,
        transactionType: "RENT" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16, commune: "El Biar", address: "Rue des frères Bouchnak",
        surface: 75, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 3,
        hasElevator: false, hasParking: false, isFurnished: false,
      },
      {
        title: "Local commercial - El Harrach",
        description: "Local commercial sur axe passant, idéal restauration ou commerce.",
        price: 15000,
        transactionType: "RENT" as const,
        propertyType: "COMMERCIAL" as const,
        wilayaCode: 16, commune: "El Harrach", address: "Route nationale El Harrach",
        surface: 80, rooms: 2,
      },
      {
        title: "F4 neuf - Draria",
        description: "Appartement neuf dans résidence fermée, finitions haut de gamme.",
        price: 22000000,
        transactionType: "SALE" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16, commune: "Draria", address: "Nouvelle cité Draria",
        surface: 130, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 2,
        hasElevator: true, hasParking: true, isFurnished: false, yearBuilt: 2024,
      },
      {
        title: "Maison coloniale - Bouzareah",
        description: "Charmante maison coloniale rénovée avec jardin et vue panoramique.",
        price: 180000,
        transactionType: "RENT" as const,
        propertyType: "HOUSE" as const,
        wilayaCode: 16, commune: "Bouzareah", address: "Hauteurs de Bouzareah",
        surface: 220, rooms: 5, bedrooms: 4, bathrooms: 2,
        hasParking: true, hasGarden: true, isFurnished: true, yearBuilt: 1935,
      },
      {
        title: "F3 lumineux - Bir Mourad Rais",
        description: "Bel appartement traversant, double exposition, quartier résidentiel.",
        price: 80000,
        transactionType: "RENT" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16, commune: "Bir Mourad Rais", address: "Cité Amirouche",
        surface: 95, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 5,
        hasElevator: true, hasParking: false, isFurnished: false,
      },
      {
        title: "Plateau de bureau - El Mouradia",
        description: "Bureau open-space climatisé, fibre optique, proche ministères.",
        price: 25000,
        transactionType: "RENT" as const,
        propertyType: "OFFICE" as const,
        wilayaCode: 16, commune: "El Mouradia", address: "Boulevard Krim Belkacem",
        surface: 150, rooms: 4,
      },
      {
        title: "F5 familial - Bordj El Kiffan",
        description: "Grand appartement familial, 3 balcons, proche plage et commerces.",
        price: 18500000,
        transactionType: "SALE" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16, commune: "Bordj El Kiffan", address: "Cité Bordj El Kiffan",
        surface: 160, rooms: 5, bedrooms: 4, bathrooms: 2, floor: 3,
        hasElevator: true, hasParking: true, isFurnished: false, yearBuilt: 2016,
      },
      {
        title: "Studio meublé - Alger centre",
        description: "Studio tout équipé en plein centre, idéal expatrié ou étudiant.",
        price: 50000,
        transactionType: "RENT" as const,
        propertyType: "STUDIO" as const,
        wilayaCode: 16, commune: "Alger", address: "Rue Larbi Ben M'hidi",
        surface: 38, rooms: 1, bedrooms: 1, bathrooms: 1, floor: 6,
        hasElevator: true, hasParking: false, isFurnished: true,
      },
      {
        title: "Terrain constructible - Staoueli",
        description: "Terrain plat de 500m² dans zone résidentielle, permis de construire obtenu.",
        price: 42000000,
        transactionType: "SALE" as const,
        propertyType: "LAND" as const,
        wilayaCode: 16, commune: "Staoueli", address: "Route de Staoueli",
        surface: 500,
      },
      {
        title: "F2 avec terrasse - Casbah",
        description: "Charmant F2 rénové dans la Casbah historique avec terrasse panoramique.",
        price: 55000,
        transactionType: "RENT" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16, commune: "Casbah", address: "Haute Casbah",
        surface: 60, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 2,
        hasElevator: false, hasParking: false, isFurnished: false,
      },
      {
        title: "Hangar industriel - Rouiba",
        description: "Hangar de stockage ou activité industrielle, accès poids lourds.",
        price: 35000,
        transactionType: "RENT" as const,
        propertyType: "COMMERCIAL" as const,
        wilayaCode: 16, commune: "Rouiba", address: "Zone industrielle Rouiba",
        surface: 600, rooms: 2,
      },
      {
        title: "Appartement haut standing - Hydra",
        description: "F4 luxueux, résidence avec piscine et salle de sport, gardiennage 24h.",
        price: 200000,
        transactionType: "RENT" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16, commune: "Hydra", address: "Résidence Les Jardins d'Hydra",
        surface: 170, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 8,
        hasElevator: true, hasParking: true, hasPool: true, isFurnished: true,
      },
      {
        title: "F3 pas cher - Bachdjerrah",
        description: "Appartement fonctionnel à petit prix, proche tramway.",
        price: 40000,
        transactionType: "RENT" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16, commune: "Bachdjerrah", address: "Cité Bachdjerrah",
        surface: 70, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 4,
        hasElevator: false, hasParking: false, isFurnished: false,
      },
      {
        title: "Villa bord de mer - Zeralda",
        description: "Magnifique villa pieds dans l'eau avec accès direct à la plage.",
        price: 90000000,
        transactionType: "SALE" as const,
        propertyType: "VILLA" as const,
        wilayaCode: 16, commune: "Zeralda", address: "Bord de mer Zeralda",
        surface: 350, rooms: 5, bedrooms: 4, bathrooms: 3,
        hasParking: true, hasGarden: true, hasPool: true, yearBuilt: 2020,
      },
      {
        title: "Garage double - Mohammadia",
        description: "Grand garage fermé sécurisé pour 2 véhicules.",
        price: 8000,
        transactionType: "RENT" as const,
        propertyType: "GARAGE" as const,
        wilayaCode: 16, commune: "Mohammadia", address: "Cité Mohammadia",
        surface: 40, rooms: 1,
      },
      {
        title: "F4 avec vue - Dar El Beida",
        description: "Bel appartement proche aéroport, idéal pour famille, vue dégagée.",
        price: 16000000,
        transactionType: "SALE" as const,
        propertyType: "APARTMENT" as const,
        wilayaCode: 16, commune: "Dar El Beida", address: "Cité Dar El Beida",
        surface: 120, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 6,
        hasElevator: true, hasParking: true, isFurnished: false, yearBuilt: 2022,
      },
      // ─── Fin annonces supplémentaires Alger ───
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
      // Utiliser les coordonnées précises du quartier si dispo
      const quartier = listingData.commune
        ? algerQuartiers[listingData.commune]
        : undefined;
      const coords = quartier ||
        cityCoords[listingData.wilayaCode] || { lat: 36.75, lng: 3.0 };
      // Petit bruit pour éviter la superposition exacte
      const lat = coords.lat + (Math.random() - 0.5) * 0.008;
      const lng = coords.lng + (Math.random() - 0.5) * 0.008;

      await prisma.listing.create({
        data: {
          ...listingData,
          latitude: lat,
          longitude: lng,
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

      try {
        await prisma.$executeRawUnsafe(
          `UPDATE listings SET location = ST_SetSRID(ST_Point(${lng}, ${lat})::geography, 4326) WHERE id = '${listing.id}'`
        );
      } catch (e) {
        console.warn(
          `⚠️  Could not set location for listing ${listing.id}, PostGIS may not be enabled`
        );
      }
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
