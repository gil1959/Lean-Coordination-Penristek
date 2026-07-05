import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing database...')
  
  // Clear all data
  await prisma.activityLog.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.rABItem.deleteMany()
  await prisma.rAB.deleteMany()
  await prisma.rACI.deleteMany()
  await prisma.task.deleteMany()
  await prisma.registration.deleteMany()
  await prisma.user.deleteMany()
  await prisma.divisi.deleteMany()

  console.log('Creating Divisions...')
  
  const pddDiv = await prisma.divisi.create({ data: { name: 'PDD' } })
  const acaraDiv = await prisma.divisi.create({ data: { name: 'Acara' } })

  console.log('Creating Users...')
  const password = await bcrypt.hash('password123', 10)

  // Function to create user
  const createUser = async (name: string, role: Role, divisiId: string | null, customEmail?: string) => {
    const email = customEmail || `${name.split(' ')[0].toLowerCase()}@bootcamp.com`
    return await prisma.user.create({
      data: {
        name,
        email,
        password,
        role,
        divisiId,
      }
    })
  }

  // Inti (Tidak ada divisi)
  await createUser('Ragil Kurniawan', Role.SUPER_ADMIN, null)
  await createUser('Kadafi Naufalla', Role.PENASIHAT, null)
  await createUser('Cahaya Vianika', Role.SEKRETARIS, null)
  await createUser('Sri Wahyuni', Role.BENDAHARA, null)

  // PDD
  await createUser('Kevin Prasetiyo', Role.KOORDINATOR_DIVISI, pddDiv.id)
  
  const pddMembers = [
    'Mario Andiko Dwi Saputra',
    'Abdillah Siraj Al Haqqi',
    'Sakina Risa Julianti',
    'Dini Kayla Putri Rahmawati',
    'Vikri Abdullah Razzak',
    'Rifqi Reis Ramadhan',
    'Ignes Puspa Lestari',
    'Muhamad Gazril Alfariz'
  ]
  
  for (const name of pddMembers) {
    await createUser(name, Role.ANGGOTA, pddDiv.id)
  }

  // Acara
  await createUser('NURMELIZAH', Role.KOORDINATOR_DIVISI, acaraDiv.id, 'nurmelizah@bootcamp.com')
  
  const acaraMembers = [
    'Achmad Apanza',
    'Elsha Dwi Yanthi Sianipar',
    'Athiya Rahma Aulia',
    'Karel Desvalyudho',
    'Muhammad Ihsan',
    'Alfarian Adisaputra',
    'Jenny Ramadhani Putri',
    'Annisa Aurelia Atrika',
    'Rafi Pratama',
    'Dwi Juliani',
    'Afifah Chairunnisya',
    'Tri Haiji Januarli'
  ]

  for (const name of acaraMembers) {
    await createUser(name, Role.ANGGOTA, acaraDiv.id)
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
