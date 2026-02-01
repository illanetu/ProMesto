/**
 * Короткая проверка БД: тестовый пользователь, тестовый промт (Mesto), голос.
 * Запуск: npm run db:check
 */
import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'check@example.com' },
    create: { email: 'check@example.com', name: 'Проверка' },
    update: {},
  })
  const mesto = await prisma.mesto.create({
    data: { title: 'Тестовый промт', content: 'Проверка связи пользователь → Mesto → голос.', visibility: 'PUBLIC', ownerId: user.id },
  })
  const vote = await prisma.vote.create({
    data: { userId: user.id, mestoId: mesto.id, value: 1 },
  })
  console.log('OK: пользователь', user.email, '→ промт', mesto.title, '→ голос', vote.id)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
