const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const tracks = [
  "Pemrograman (Programming)",
  "Keamanan Siber (Cyber Security)",
  "Penambangan Data (Data Mining)",
  "Desain Pengalaman Pengguna (User Experience / UX Design)",
  "Animasi (Animation)",
  "Kota Cerdas (Smart City)",
  "Karya Tulis Ilmiah TIK",
  "Pengembangan Perangkat Lunak (Software Development)",
  "Piranti Cerdas, Sistem Benam & IoT (Internet of Things)",
  "Pengembangan Aplikasi Permainan (Game Development)",
  "Pengembangan Bisnis TIK (ICT Business Development)"
];

async function main() {
  console.log("Seeding Bootcamp Tracks...");
  for (const track of tracks) {
    await prisma.bootcampTrack.upsert({
      where: { name: track },
      update: {},
      create: { name: track }
    });
  }
  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
