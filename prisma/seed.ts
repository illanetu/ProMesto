import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем seeding...')

  // Очищаем существующие записи
  await prisma.note.deleteMany()

  // Создаем тестовые записи
  const notes = await Promise.all([
    prisma.note.create({
      data: {
        title: 'Первая заметка',
      },
    }),
    prisma.note.create({
      data: {
        title: 'Вторая заметка',
      },
    }),
    prisma.note.create({
      data: {
        title: 'Третья заметка',
      },
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
