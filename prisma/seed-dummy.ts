import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Menyiapkan Data Dummy untuk Presentasi...");

  // Hapus semua data yang ada (Kecuali Super Admin jika ada, tapi lebih mudah wipe bersih karena foreign key dependencies)
  // Untuk amannya, kita delete berdasarkan model berurutan untuk menghindari foreign key constraint error.
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.rABItem.deleteMany();
  await prisma.rAB.deleteMany();
  await prisma.rACI.deleteMany();
  await prisma.task.deleteMany();
  
  // Hapus semua user kecuali admin@bootcamp.com agar sesi login tetap aman (optional, tapi kita buat saja akun baru jika perlu)
  await prisma.user.deleteMany({
    where: { email: { not: "admin@bootcamp.com" } }
  });
  
  await prisma.divisi.deleteMany();

  // 1. BUAT DIVISI
  const divisiAcara = await prisma.divisi.create({ data: { name: "Acara" } });
  const divisiPdd = await prisma.divisi.create({ data: { name: "PDD (Publikasi, Dekorasi, Dokumentasi)" } });
  const divisiHumas = await prisma.divisi.create({ data: { name: "Humas" } });

  console.log("Divisi dibuat:", divisiAcara.name, divisiPdd.name);

  // 2. BUAT USER (Password seragam: password123)
  const pwd = await bcrypt.hash("password123", 10);
  
  // Akun Inti
  const bendahara = await prisma.user.create({ data: { name: "Budi Bendahara", email: "bendahara@test.com", password: pwd, role: "BENDAHARA" } });
  const sekretaris = await prisma.user.create({ data: { name: "Siti Sekretaris", email: "sekretaris@test.com", password: pwd, role: "SEKRETARIS" } });
  const penasihat = await prisma.user.create({ data: { name: "Pak Dosen (Penasihat)", email: "penasihat@test.com", password: pwd, role: "PENASIHAT" } });

  // Akun Acara
  const coAcara = await prisma.user.create({ data: { name: "Andi (CO Acara)", email: "co.acara@test.com", password: pwd, role: "KOORDINATOR_DIVISI", divisiId: divisiAcara.id } });
  const anggotaAcara1 = await prisma.user.create({ data: { name: "Citra (Anggota Acara)", email: "citra.acara@test.com", password: pwd, role: "ANGGOTA", divisiId: divisiAcara.id } });
  const anggotaAcara2 = await prisma.user.create({ data: { name: "Deni (PJ Panggung)", email: "deni.acara@test.com", password: pwd, role: "PJ", divisiId: divisiAcara.id } });

  // Akun PDD
  const coPdd = await prisma.user.create({ data: { name: "Eka (CO PDD)", email: "co.pdd@test.com", password: pwd, role: "KOORDINATOR_DIVISI", divisiId: divisiPdd.id } });
  const anggotaPdd1 = await prisma.user.create({ data: { name: "Fajar (Desainer PDD)", email: "fajar.pdd@test.com", password: pwd, role: "ANGGOTA", divisiId: divisiPdd.id } });

  console.log("User dummy dibuat...");

  // 3. BUAT TASK (Document Tracking)
  // Task Acara
  const taskA1 = await prisma.task.create({
    data: {
      title: "Menyusun Rundown Acara Utama", divisiId: divisiAcara.id, picId: coAcara.id, status: "SELESAI",
      notes: "Rundown sudah difinalisasi bersama pembicara."
    }
  });
  const taskA2 = await prisma.task.create({
    data: {
      title: "Menghubungi Guest Star", divisiId: divisiAcara.id, picId: anggotaAcara1.id, status: "PROSES",
      notes: "Menunggu konfirmasi harga."
    }
  });
  const taskA3 = await prisma.task.create({
    data: {
      title: "Menyewa Sound System", divisiId: divisiAcara.id, picId: anggotaAcara2.id, status: "BELUM"
    }
  });

  // Task PDD
  const taskP1 = await prisma.task.create({
    data: {
      title: "Desain Poster Utama", divisiId: divisiPdd.id, picId: anggotaPdd1.id, status: "PROSES",
      notes: "Revisi 2 warna background."
    }
  });
  const taskP2 = await prisma.task.create({
    data: {
      title: "Cetak Name Tag Panitia", divisiId: divisiPdd.id, picId: coPdd.id, status: "BELUM"
    }
  });

  console.log("Tugas (Task) dummy dibuat...");

  // 4. BUAT RACI
  await prisma.rACI.createMany({
    data: [
      // Task A1 (Rundown)
      { taskId: taskA1.id, userId: coAcara.id, roleType: "R" },
      { taskId: taskA1.id, userId: sekretaris.id, roleType: "A" },
      { taskId: taskA1.id, userId: penasihat.id, roleType: "I" },
      
      // Task A2 (Guest Star)
      { taskId: taskA2.id, userId: anggotaAcara1.id, roleType: "R" },
      { taskId: taskA2.id, userId: coAcara.id, roleType: "A" },
      { taskId: taskA2.id, userId: bendahara.id, roleType: "C" },

      // Task P1 (Desain Poster)
      { taskId: taskP1.id, userId: anggotaPdd1.id, roleType: "R" },
      { taskId: taskP1.id, userId: coPdd.id, roleType: "A" },
      { taskId: taskP1.id, userId: coAcara.id, roleType: "C" }, // Konsultasi desain ke acara
    ]
  });

  console.log("RACI Matrix diisi...");

  // 5. BUAT RAB (Rencana Anggaran Biaya)
  // Usulan dari Acara
  const rabAcara = await prisma.rAB.create({
    data: {
      title: "RAB Kebutuhan Panggung & Guest Star", status: "USULAN", creatorId: coAcara.id,
      items: {
        create: [
          { category: "Peralatan", item: "Sewa Sound System & Lighting", qty: 1, unitPrice: 5000000, subtotal: 5000000 },
          { category: "Konsumsi", item: "Snack Guest Star", qty: 10, unitPrice: 35000, subtotal: 350000 },
          { category: "Honorarium", item: "Fee Band Lokal", qty: 1, unitPrice: 2000000, subtotal: 2000000 },
        ]
      }
    }
  });

  // Usulan dari PDD (Sudah Diteruskan / Submitted)
  const rabPdd = await prisma.rAB.create({
    data: {
      title: "RAB Publikasi & Cetak", status: "SUBMITTED", creatorId: coPdd.id,
      items: {
        create: [
          { category: "Percetakan", item: "Spanduk 3x4m", qty: 2, unitPrice: 150000, subtotal: 300000 },
          { category: "Percetakan", item: "Lanyard & Name Tag Panitia", qty: 50, unitPrice: 15000, subtotal: 750000 },
        ]
      }
    }
  });
  
  // Draf dari Bendahara
  const rabBendahara = await prisma.rAB.create({
    data: {
      title: "RAB Kebutuhan Kesekretariatan", status: "DRAFT", creatorId: bendahara.id,
      items: {
        create: [
          { category: "ATK", item: "Kertas HVS A4", qty: 2, unitPrice: 55000, subtotal: 110000 },
          { category: "ATK", item: "Tinta Printer", qty: 1, unitPrice: 120000, subtotal: 120000 },
        ]
      }
    }
  });

  console.log("Dokumen RAB dummy dibuat...");
  console.log("===================================");
  console.log("Seed Dummy Berhasil Dieksekusi!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
