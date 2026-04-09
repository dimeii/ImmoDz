import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Quartiers des 6 grandes villes algériennes
const quartiersData: Record<number, string[]> = {
  // 16 — Alger
  16: [
    "Bab El Oued", "Casbah", "Hussein Dey", "Kouba", "El Biar",
    "Hydra", "Ben Aknoun", "Bir Mourad Rais", "Bouzareah", "Dely Ibrahim",
    "Draria", "El Harrach", "Bab Ezzouar", "Bordj El Kiffan", "Dar El Beida",
    "Mohammadia", "Ain Benian", "Staoueli", "Zeralda", "Cheraga",
    "Ouled Fayet", "El Achour", "Birtouta", "Rouiba", "Reghaia",
    "Ain Taya", "Bordj El Bahri", "El Marsa", "Sidi M'Hamed", "Belouizdad",
    "El Mouradia", "Alger Centre", "Bologhine", "Oued Smar", "Les Eucalyptus",
    "Baraki", "Saoula", "Beni Messous", "El Madania", "Said Hamdine",
    "Douera", "Khraissia", "Tessala El Merdja", "Mahelma",
  ],
  // 31 — Oran
  31: [
    "Oran Centre", "Hai Sabah", "Hai El Makkari", "Es Senia",
    "Bir El Djir", "Ain El Turck", "Arzew", "Bethioua",
    "Bousfer", "El Kerma", "Canastel", "Hai Khemisti",
    "Hai El Yasmine", "Hai USTO", "Les Amandiers", "Medina Jedida",
    "Plateau Saint-Michel", "Sidi El Houari", "Gambetta",
    "Maraval", "Dar El Beida", "Hai El Barki", "Hai Fellaoucene",
    "Hai Bouamama", "Hai Nedjma", "Belgaid", "Misserghine",
  ],
  // 27 — Mostaganem
  27: [
    "Mostaganem Centre", "Kharouba", "Mazagran", "Ain Nouissy",
    "Hassi Maameche", "Ain Tedeles", "Sidi Ali", "Achaacha",
    "Bouguirat", "Sidi Lakhdar", "Fornaka", "Sayada",
    "Mesra", "Sirat", "Touahria", "Oued El Kheir",
  ],
  // 25 — Constantine
  25: [
    "Constantine Centre", "Sidi Mabrouk", "Djebel El Ouahch", "Ain Smara",
    "El Khroub", "Hamma Bouziane", "Didouche Mourad", "Zighoud Youcef",
    "Ali Mendjeli", "Massinissa", "Daksi", "Sidi Rached",
    "Bab El Kantra", "Ziadia", "Belle Vue", "Ciloc",
    "UV Soustara", "Hai Zouaghi", "Hai El Bir", "Bekira",
  ],
  // 23 — Annaba
  23: [
    "Annaba Centre", "Sidi Amar", "El Bouni", "El Hadjar",
    "Berrahal", "Ain El Berda", "Seraidi", "Chetaibi",
    "Oued El Aneb", "Treat", "El Eulma", "La Colonne",
    "Hai Didouche Mourad", "Hai Seybouse", "Plaine Ouest",
    "Kouba", "Hai Rym", "Joinville", "Les Lauriers Roses",
  ],
  // 19 — Sétif
  19: [
    "Setif Centre", "El Eulma", "Ain Oulmene", "Ain Arnat",
    "Ain El Kebira", "Bougaa", "Djemila", "Guenzet",
    "Ksar El Abtal", "Ain Azel", "Bir El Arch", "Amoucha",
    "Beni Aziz", "Babor", "Ain Trick", "Hai Bouaroua",
    "Hai El Hidhab", "Hai Chouhada", "Cite Dallas", "Hai Maabouda",
  ],
};

async function main() {
  console.log("=== Seeding Quartiers ===\n");

  let total = 0;
  let created = 0;

  for (const [wilayaCodeStr, quartiers] of Object.entries(quartiersData)) {
    const wilayaCode = parseInt(wilayaCodeStr);

    // Vérifier que la wilaya existe
    const wilaya = await prisma.wilaya.findUnique({ where: { code: wilayaCode } });
    if (!wilaya) {
      console.warn(`Wilaya ${wilayaCode} not found, skipping`);
      continue;
    }

    console.log(`${wilaya.name} (${wilayaCode}): ${quartiers.length} quartiers`);

    for (const name of quartiers) {
      total++;
      try {
        await prisma.quartier.upsert({
          where: { name_wilayaCode: { name, wilayaCode } },
          update: {},
          create: { name, wilayaCode },
        });
        created++;
      } catch (err) {
        console.warn(`  Failed to create "${name}": ${err}`);
      }
    }
  }

  console.log(`\n=== Done: ${created}/${total} quartiers seeded ===`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
