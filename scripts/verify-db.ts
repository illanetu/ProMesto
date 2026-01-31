/**
 * Скрипт проверки: создаёт тестового пользователя, тестовую запись о месте (Mesto) и голос.
 * Запуск: npx tsx scripts/verify-db.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Проверка БД: создаём тестового пользователя, Mesto и голос...')

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    create: {
      email: 'test@example.com',
      name: 'Тестовый пользователь',
    },
    update: {},
  })
  console.log('Пользователь:', user.email, user.name ?? '')

  const mesto = await prisma.mesto.create({
    data: {
      title: 'Тестовое место',
      content: 'Описание тестового места для проверки.',
      visibility: 'PUBLIC',
      ownerId: user.id,
    },
  })
  console.log('Mesto:', mesto.title, '(id:', mesto.id, ')')

  const vote = await prisma.vote.create({
    data: {
      userId: user.id,
      mestoId: mesto.id,
      value: 1,
    },
  })
  console.log('Голос создан:', vote.id, 'value:', vote.value)

  console.log('Готово.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Ошибка:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
