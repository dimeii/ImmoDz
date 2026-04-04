import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const cityCoords: Record<number, { lat: number; lng: number }> = {
  16: { lat: 36.737, lng: 3.0588 },
  31: { lat: 35.6953, lng: -0.6435 },
  25: { lat: 36.3791, lng: 6.6145 },
  23: { lat: 36.906, lng: 7.7663 },
  19: { lat: 36.1899, lng: 5.3669 },
  15: { lat: 36.7155, lng: 4.2559 },
  9: { lat: 36.4699, lng: 2.8277 },
  35: { lat: 36.5244, lng: 3.4822 },
  5: { lat: 35.5619, lng: 6.1745 },
  6: { lat: 36.7508, lng: 5.0567 },
  42: { lat: 36.5899, lng: 2.4475 },
  13: { lat: 34.8828, lng: -1.3148 },
  27: { lat: 35.9311, lng: 0.0892 },
  7: { lat: 34.8485, lng: 5.7248 },
  47: { lat: 32.4909, lng: 3.6742 },
  30: { lat: 31.9527, lng: 5.3175 },
  21: { lat: 36.8764, lng: 6.9086 },
  34: { lat: 36.0733, lng: 4.7629 },
  43: { lat: 36.4503, lng: 6.2642 },
  2: { lat: 36.1647, lng: 1.3317 },
};

const extraListings = [
  // ─── ORAN ───
  {
    title: "F3 vue mer - Oran Front de mer",
    description: "Superbe appartement avec vue panoramique sur le port d'Oran. Résidence récente, gardiennage 24h.",
    price: 75000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 31, commune: "Oran", address: "Boulevard Front de Mer",
    surface: 95, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 8,
    hasElevator: true, hasParking: true, isFurnished: false,
  },
  {
    title: "Villa coloniale rénovée - Oran Gambetta",
    description: "Villa de charme entièrement rénovée, matériaux nobles, jardin avec orangers.",
    price: 45000000, transactionType: "SALE" as const, propertyType: "VILLA" as const,
    wilayaCode: 31, commune: "Oran", address: "Quartier Gambetta",
    surface: 280, rooms: 5, bedrooms: 4, bathrooms: 2,
    hasParking: true, hasGarden: true, isFurnished: false, yearBuilt: 1940,
  },
  {
    title: "Appartement F4 neuf - Oran Es-Senia",
    description: "Appartement neuf dans programme promotionnel, finitions modernes, cuisine équipée.",
    price: 19500000, transactionType: "SALE" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 31, commune: "Es-Senia", address: "Nouvelle cité Es-Senia",
    surface: 120, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 4,
    hasElevator: true, hasParking: true, isFurnished: false, yearBuilt: 2025,
  },
  {
    title: "Studio meublé centre-ville - Oran",
    description: "Studio tout confort au coeur d'Oran, idéal jeune professionnel.",
    price: 35000, transactionType: "RENT" as const, propertyType: "STUDIO" as const,
    wilayaCode: 31, commune: "Oran", address: "Rue Larbi Ben M'hidi",
    surface: 35, rooms: 1, bedrooms: 1, bathrooms: 1, floor: 3,
    hasElevator: false, hasParking: false, isFurnished: true,
  },
  {
    title: "Local commercial - Oran Medina Jdida",
    description: "Emplacement premium dans le quartier commerçant, grande vitrine.",
    price: 20000, transactionType: "RENT" as const, propertyType: "COMMERCIAL" as const,
    wilayaCode: 31, commune: "Oran", address: "Medina Jdida",
    surface: 60, rooms: 1, hasStorefront: true,
  },

  // ─── CONSTANTINE ───
  {
    title: "F3 moderne - Constantine Nouvelle Ville",
    description: "Appartement moderne dans résidence fermée, vue sur les gorges du Rhummel.",
    price: 55000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 25, commune: "Constantine", address: "Nouvelle Ville Ali Mendjeli",
    surface: 90, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 5,
    hasElevator: true, hasParking: true, isFurnished: false,
  },
  {
    title: "Villa familiale - Constantine El Khroub",
    description: "Grande villa avec jardin et terrasse, quartier calme et familial.",
    price: 25000000, transactionType: "SALE" as const, propertyType: "VILLA" as const,
    wilayaCode: 25, commune: "El Khroub", address: "Cité El Khroub",
    surface: 220, rooms: 5, bedrooms: 4, bathrooms: 2,
    hasParking: true, hasGarden: true, isFurnished: false, yearBuilt: 2015,
  },
  {
    title: "F2 étudiant - Constantine centre",
    description: "Petit appartement idéal pour étudiant, proche université et tramway.",
    price: 25000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 25, commune: "Constantine", address: "Rue Abane Ramdane",
    surface: 55, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 2,
    hasElevator: false, hasParking: false, isFurnished: true,
  },

  // ─── ANNABA ───
  {
    title: "Appartement bord de mer - Annaba Seraidi",
    description: "F3 avec terrasse face à la mer, résidence touristique avec piscine.",
    price: 85000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 23, commune: "Annaba", address: "Corniche Seraidi",
    surface: 100, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 4,
    hasElevator: true, hasParking: true, hasPool: true, isFurnished: true,
  },
  {
    title: "Maison avec jardin - Annaba El Bouni",
    description: "Maison individuelle avec grand jardin, garage et terrasse couverte.",
    price: 18000000, transactionType: "SALE" as const, propertyType: "HOUSE" as const,
    wilayaCode: 23, commune: "El Bouni", address: "Quartier El Bouni",
    surface: 180, rooms: 4, bedrooms: 3, bathrooms: 2,
    hasParking: true, hasGarden: true, isFurnished: false, yearBuilt: 2010,
  },

  // ─── SETIF ───
  {
    title: "F4 standing - Sétif centre",
    description: "Bel appartement dans tour moderne, ascenseur rapide, vue ville.",
    price: 60000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 19, commune: "Sétif", address: "Avenue 8 mai 1945",
    surface: 130, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 10,
    hasElevator: true, hasParking: true, isFurnished: false,
  },
  {
    title: "Terrain agricole - Sétif",
    description: "Terrain fertile irrigué, idéal maraîchage ou arboriculture.",
    price: 8000000, transactionType: "SALE" as const, propertyType: "LAND" as const,
    wilayaCode: 19, commune: "Sétif", address: "Plaine de Sétif",
    surface: 2000,
  },

  // ─── BEJAIA ───
  {
    title: "Maison kabyle rénovée - Béjaïa",
    description: "Maison traditionnelle kabyle rénovée avec goût, vue montagne et mer.",
    price: 15000000, transactionType: "SALE" as const, propertyType: "HOUSE" as const,
    wilayaCode: 6, commune: "Béjaïa", address: "Quartier Sidi Soufi",
    surface: 160, rooms: 4, bedrooms: 3, bathrooms: 1,
    hasGarden: true, isFurnished: false, yearBuilt: 1980,
  },
  {
    title: "F2 vue port - Béjaïa centre",
    description: "Appartement lumineux avec vue sur le port et la Casbah.",
    price: 40000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 6, commune: "Béjaïa", address: "Boulevard Amirouche",
    surface: 65, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 5,
    hasElevator: true, hasParking: false, isFurnished: false,
  },

  // ─── TIZI OUZOU ───
  {
    title: "Villa sur les hauteurs - Tizi Ouzou",
    description: "Villa avec vue panoramique sur la vallée, jardin arboré, très calme.",
    price: 30000000, transactionType: "SALE" as const, propertyType: "VILLA" as const,
    wilayaCode: 15, commune: "Tizi Ouzou", address: "Hauteurs de Tizi Ouzou",
    surface: 300, rooms: 6, bedrooms: 4, bathrooms: 3,
    hasParking: true, hasGarden: true, isFurnished: false, yearBuilt: 2017,
  },
  {
    title: "F3 centre-ville - Tizi Ouzou",
    description: "Appartement bien situé, commerces et transports à proximité.",
    price: 45000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 15, commune: "Tizi Ouzou", address: "Boulevard Stiti Ali",
    surface: 80, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 3,
    hasElevator: false, hasParking: false, isFurnished: false,
  },

  // ─── BLIDA ───
  {
    title: "F4 résidence des roses - Blida",
    description: "Grand appartement dans résidence verdoyante, proche gare et autoroute.",
    price: 65000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 9, commune: "Blida", address: "Résidence des Roses",
    surface: 110, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 2,
    hasElevator: true, hasParking: true, isFurnished: false,
  },
  {
    title: "Terrain constructible - Blida Ouled Yaich",
    description: "Terrain en zone urbaine, tous réseaux à proximité.",
    price: 12000000, transactionType: "SALE" as const, propertyType: "LAND" as const,
    wilayaCode: 9, commune: "Ouled Yaich", address: "Route de Ouled Yaich",
    surface: 300,
  },

  // ─── TIPAZA ───
  {
    title: "Villa bord de mer - Tipaza",
    description: "Villa pieds dans l'eau avec piscine, cadre exceptionnel face aux ruines romaines.",
    price: 55000000, transactionType: "SALE" as const, propertyType: "VILLA" as const,
    wilayaCode: 42, commune: "Tipaza", address: "Corniche de Tipaza",
    surface: 320, rooms: 5, bedrooms: 4, bathrooms: 3,
    hasParking: true, hasGarden: true, hasPool: true, yearBuilt: 2018,
  },
  {
    title: "F3 résidence balnéaire - Tipaza",
    description: "Appartement dans résidence balnéaire avec accès plage privée.",
    price: 70000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 42, commune: "Tipaza", address: "Zone touristique Matarès",
    surface: 85, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 1,
    hasElevator: false, hasParking: true, hasPool: true, isFurnished: true,
  },

  // ─── BOUMERDES ───
  {
    title: "F2 plage - Boumerdès centre",
    description: "Petit appartement à 200m de la plage, idéal saison estivale.",
    price: 35000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 35, commune: "Boumerdès", address: "Boulevard front de mer",
    surface: 55, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 3,
    hasElevator: false, hasParking: false, isFurnished: true,
  },

  // ─── TLEMCEN ───
  {
    title: "Maison traditionnelle - Tlemcen médina",
    description: "Dar authentique avec patio central, zelliges et boiseries, entièrement restaurée.",
    price: 22000000, transactionType: "SALE" as const, propertyType: "HOUSE" as const,
    wilayaCode: 13, commune: "Tlemcen", address: "Médina de Tlemcen",
    surface: 200, rooms: 5, bedrooms: 3, bathrooms: 2,
    hasGarden: true, isFurnished: false, yearBuilt: 1890,
  },
  {
    title: "F3 moderne - Tlemcen Imama",
    description: "Appartement neuf avec finitions soignées, quartier résidentiel.",
    price: 40000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 13, commune: "Tlemcen", address: "Cité Imama",
    surface: 85, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 4,
    hasElevator: true, hasParking: true, isFurnished: false,
  },

  // ─── BATNA ───
  {
    title: "F4 familial - Batna centre",
    description: "Spacieux appartement familial, proche marché et écoles.",
    price: 35000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 5, commune: "Batna", address: "Boulevard de la République",
    surface: 110, rooms: 4, bedrooms: 3, bathrooms: 1, floor: 2,
    hasElevator: false, hasParking: false, isFurnished: false,
  },
  {
    title: "Villa neuve - Batna Parc à Fourrage",
    description: "Villa moderne sur 2 niveaux, garage, jardin, quartier prisé.",
    price: 28000000, transactionType: "SALE" as const, propertyType: "VILLA" as const,
    wilayaCode: 5, commune: "Batna", address: "Parc à Fourrage",
    surface: 250, rooms: 5, bedrooms: 4, bathrooms: 2,
    hasParking: true, hasGarden: true, isFurnished: false, yearBuilt: 2023,
  },

  // ─── MOSTAGANEM ───
  {
    title: "Appartement vue mer - Mostaganem",
    description: "F3 avec balcon face à la mer, plage à 5 minutes à pied.",
    price: 50000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 27, commune: "Mostaganem", address: "Corniche Mostaganem",
    surface: 80, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 6,
    hasElevator: true, hasParking: false, isFurnished: false,
  },

  // ─── BISKRA ───
  {
    title: "Maison avec palmeraie - Biskra",
    description: "Maison spacieuse entourée de palmiers, ambiance oasis, très calme.",
    price: 12000000, transactionType: "SALE" as const, propertyType: "HOUSE" as const,
    wilayaCode: 7, commune: "Biskra", address: "Quartier Hai Nasr",
    surface: 200, rooms: 5, bedrooms: 4, bathrooms: 2,
    hasParking: true, hasGarden: true, isFurnished: false, yearBuilt: 2008,
  },

  // ─── GHARDAIA ───
  {
    title: "Maison mozabite traditionnelle - Ghardaïa",
    description: "Maison typique M'zab avec architecture traditionnelle unique, classée patrimoine.",
    price: 18000000, transactionType: "SALE" as const, propertyType: "HOUSE" as const,
    wilayaCode: 47, commune: "Ghardaïa", address: "Ksar de Ghardaïa",
    surface: 150, rooms: 4, bedrooms: 3, bathrooms: 1,
    isFurnished: false, yearBuilt: 1850,
  },

  // ─── OUARGLA ───
  {
    title: "Villa moderne - Ouargla Hassi Messaoud",
    description: "Villa haut standing pour cadre pétrolier, climatisation centrale, sécurisée.",
    price: 120000, transactionType: "RENT" as const, propertyType: "VILLA" as const,
    wilayaCode: 30, commune: "Hassi Messaoud", address: "Base de vie",
    surface: 200, rooms: 4, bedrooms: 3, bathrooms: 2,
    hasParking: true, hasGarden: true, isFurnished: true,
  },

  // ─── SKIKDA ───
  {
    title: "F2 plage Stora - Skikda",
    description: "Appartement coquet avec vue sur le port de Stora, quartier touristique.",
    price: 40000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 21, commune: "Skikda", address: "Port de Stora",
    surface: 60, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 2,
    hasElevator: false, hasParking: false, isFurnished: true,
  },

  // ─── BBA ───
  {
    title: "F3 neuf - Bordj Bou Arréridj",
    description: "Appartement neuf dans promotion immobilière, bon rapport qualité-prix.",
    price: 10000000, transactionType: "SALE" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 34, commune: "Bordj Bou Arréridj", address: "Nouvelle cité",
    surface: 85, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 3,
    hasElevator: true, hasParking: true, isFurnished: false, yearBuilt: 2024,
  },

  // ─── CHLEF ───
  {
    title: "Maison parasismique - Chlef",
    description: "Maison construite aux normes parasismiques, terrain clôturé.",
    price: 14000000, transactionType: "SALE" as const, propertyType: "HOUSE" as const,
    wilayaCode: 2, commune: "Chlef", address: "Cité des 500 logements",
    surface: 160, rooms: 4, bedrooms: 3, bathrooms: 2,
    hasParking: true, hasGarden: true, isFurnished: false, yearBuilt: 2012,
  },

  // ─── Plus d'annonces Alger pour densifier ───
  {
    title: "Loft industriel - Alger Hussein Dey",
    description: "Ancien atelier transformé en loft moderne, hauteur sous plafond 4m, style unique.",
    price: 110000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 16, commune: "Hussein Dey", address: "Zone industrielle reconvertie",
    surface: 150, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 1,
    hasElevator: false, hasParking: true, isFurnished: true,
  },
  {
    title: "F5 duplex - Alger El Biar",
    description: "Magnifique duplex avec rooftop privé, matériaux haut de gamme.",
    price: 48000000, transactionType: "SALE" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 16, commune: "El Biar", address: "Avenue Colonel Bougara",
    surface: 230, rooms: 5, bedrooms: 4, bathrooms: 3, floor: 9,
    hasElevator: true, hasParking: true, isFurnished: false, yearBuilt: 2023,
  },
  {
    title: "Local restaurant équipé - Alger Sidi Yahia",
    description: "Restaurant entièrement équipé, extraction, terrasse, emplacement premium.",
    price: 45000, transactionType: "RENT" as const, propertyType: "COMMERCIAL" as const,
    wilayaCode: 16, commune: "Hydra", address: "Rue Sidi Yahia",
    surface: 120, rooms: 3, hasStorefront: true, hasWater: true, hasElectricity: true, hasGas: true,
  },
  {
    title: "Colocation F4 - Alger Ben Aknoun",
    description: "Chambre disponible en colocation dans F4 spacieux, proche fac et CU.",
    price: 25000, transactionType: "RENT" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 16, commune: "Ben Aknoun", address: "Cité universitaire Ben Aknoun",
    surface: 120, rooms: 4, bedrooms: 3, bathrooms: 1, floor: 2,
    hasElevator: false, hasParking: false, isFurnished: true,
  },
  {
    title: "Penthouse prestige - Alger Hydra",
    description: "Penthouse d'exception avec terrasse 80m², jacuzzi, vue 360° sur la baie d'Alger.",
    price: 75000000, transactionType: "SALE" as const, propertyType: "APARTMENT" as const,
    wilayaCode: 16, commune: "Hydra", address: "Résidence Prestige Hydra",
    surface: 300, rooms: 5, bedrooms: 4, bathrooms: 3, floor: 15,
    hasElevator: true, hasParking: true, hasPool: true, isFurnished: true, yearBuilt: 2024,
  },
];

async function main() {
  console.log("🌱 Adding extra sample data...");

  // Get existing users to assign listings
  const users = await prisma.user.findMany({ take: 5 });
  if (users.length === 0) {
    console.error("❌ No users found. Run the main seed first.");
    process.exit(1);
  }

  let created = 0;
  for (const listing of extraListings) {
    const coords = cityCoords[listing.wilayaCode] || { lat: 36.75, lng: 3.0 };
    const lat = coords.lat + (Math.random() - 0.5) * 0.015;
    const lng = coords.lng + (Math.random() - 0.5) * 0.015;

    await prisma.listing.create({
      data: {
        ...listing,
        latitude: lat,
        longitude: lng,
        userId: users[Math.floor(Math.random() * users.length)].id,
        status: "ACTIVE",
      },
    });
    created++;
  }

  console.log(`✅ Added ${created} extra listings across multiple wilayas.`);
  console.log("🎉 Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
