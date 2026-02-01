/**
 * Короткая проверка БД: тестовый пользователь, тестовые записи (заметки, места), голос.
 * Запуск: npm run db:check
 */
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { PrismaClient } from '../generated/prisma'

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) return
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
      value = value.slice(1, -1)
    if (!process.env[key]) process.env[key] = value
  }
}

function createClient() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL не задан. Создайте .env с DATABASE_URL.')
  const withTimeout = url.includes('?') ? `${url}&connect_timeout=30` : `${url}?connect_timeout=30`
  return new PrismaClient({ datasources: { db: { url: withTimeout } } })
}

async function run(prisma: PrismaClient) {
  await prisma.$connect()

  const user = await prisma.user.upsert({
    where: { email: 'check@example.com' },
    create: { email: 'check@example.com', name: 'Проверка' },
    update: {},
  })

  const note1 = await prisma.note.create({
    data: { title: 'Тестовая заметка 1', ownerId: user.id },
  })
  const note2 = await prisma.note.create({
    data: { title: 'Тестовая заметка 2', ownerId: user.id },
  })

  const mesto1 = await prisma.mesto.create({
    data: {
      title: 'Тестовое место 1',
      content: 'Описание места для проверки.',
      visibility: 'PUBLIC',
      ownerId: user.id,
    },
  })
  const mesto2 = await prisma.mesto.create({
    data: {
      title: 'Тестовое место 2',
      content: 'Второе тестовое место.',
      visibility: 'PRIVATE',
      ownerId: user.id,
    },
  })

  const vote = await prisma.vote.create({
    data: { userId: user.id, mestoId: mesto1.id, value: 1 },
  })

  console.log('OK: пользователь', user.email)
  console.log('   заметки:', note1.title, ',', note2.title)
  console.log('   места:', mesto1.title, ',', mesto2.title)
  console.log('   голос за', mesto1.title, '→', vote.id)
}

async function main() {
  loadEnv()
  let prisma = createClient()
  try {
    await run(prisma)
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === 'P1017' || (err instanceof Error && err.message.includes('closed'))) {
      await prisma.$disconnect()
      console.log('Соединение разорвано. Повторная попытка через 2 с...')
      await new Promise((r) => setTimeout(r, 2000))
      prisma = createClient()
      await run(prisma)
    } else {
      throw e
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
