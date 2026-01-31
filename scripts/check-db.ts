import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function checkConnection() {
  try {
    console.log('Проверка подключения к базе данных...')

    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Подключение успешно!', result)

    const [users, notes, mestos, votes] = await Promise.all([
      prisma.user.count(),
      prisma.note.count(),
      prisma.mesto.count(),
      prisma.vote.count(),
    ])
    console.log('Таблицы: users =', users, ', notes =', notes, ', mestos =', mestos, ', votes =', votes)
  } catch (error) {
    console.error('❌ Ошибка подключения:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkConnection()
