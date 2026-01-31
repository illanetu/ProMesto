import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем seeding...')

  const user = await prisma.user.upsert({
    where: { email: 'seed@example.com' },
    create: {
      email: 'seed@example.com',
      name: 'Seed пользователь',
    },
    update: {},
  })

  await prisma.note.deleteMany({ where: { ownerId: user.id } })

  const notes = await Promise.all([
    prisma.note.create({
      data: { title: 'Первая заметка', ownerId: user.id },
    }),
    prisma.note.create({
      data: { title: 'Вторая заметка', ownerId: user.id },
    }),
    prisma.note.create({
      data: { title: 'Третья заметка', ownerId: user.id },
    }),
  ])

  console.log(`✅ Создано ${notes.length} заметок`)
  console.log('Заметки:', notes)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Ошибка при seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
