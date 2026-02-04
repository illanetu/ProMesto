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
  loadEnv()
  const url = process.env.DATABASE_URL
  if (!url) return new PrismaClient()
  const withTimeout = url.includes('?') ? `${url}&connect_timeout=30` : `${url}?connect_timeout=30`
  return new PrismaClient({ datasources: { db: { url: withTimeout } } })
}

const prisma = createClient()

async function run() {
  await prisma.$connect()

  const user = await prisma.user.upsert({
    where: { email: 'seed@example.com' },
    create: { email: 'seed@example.com', name: 'Seed пользователь' },
    update: {},
  })

  await prisma.note.deleteMany({ where: { ownerId: user.id } })
  const notes = await Promise.all([
    prisma.note.create({ data: { title: 'Первая заметка', ownerId: user.id } }),
    prisma.note.create({ data: { title: 'Вторая заметка', ownerId: user.id } }),
    prisma.note.create({ data: { title: 'Третья заметка', ownerId: user.id } }),
  ])
  console.log(`✅ Заметок: ${notes.length}`)

  const category = await prisma.category.upsert({
    where: { id: 'seed-cat-1' },
    create: { id: 'seed-cat-1', category: 'Тестовая категория' },
    update: {},
  })

  const m1 = await prisma.mesto.create({
    data: {
      title: 'Тестовое место 1',
      content: 'Описание первого места.',
      visibility: 'PUBLIC',
      isFavorite: false,
      ownerId: user.id,
      categoryId: category.id,
    },
  })
  const m2 = await prisma.mesto.create({
    data: {
      title: 'Тестовое место 2',
      content: 'Второе место.',
      visibility: 'PRIVATE',
      isFavorite: true,
      ownerId: user.id,
    },
  })
  console.log(`✅ Мест (Mesto): 2`)

  const tag1 = await prisma.tag.upsert({
    where: { id: 'seed-tag-1' },
    create: { id: 'seed-tag-1', name: 'тест' },
    update: {},
  })
  const tag2 = await prisma.tag.upsert({
    where: { id: 'seed-tag-2' },
    create: { id: 'seed-tag-2', name: 'демо' },
    update: {},
  })
  await prisma.mesto.update({
    where: { id: m1.id },
    data: { tags: { connect: [{ id: tag1.id }, { id: tag2.id }] } },
  })
  console.log(`✅ Теги привязаны к месту`)

  await prisma.vote.create({
    data: { userId: user.id, mestoId: m1.id, value: 1 },
  })
  console.log(`✅ Голос за публичное место`)

  console.log('🌱 Seeding завершён.')
}

async function main() {
  console.log('🌱 Начинаем seeding...')
  try {
    await run()
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === 'P1017' || (e instanceof Error && e.message.includes('closed'))) {
      await prisma.$disconnect()
      console.log('Соединение разорвано. Повторная попытка через 2 с...')
      await new Promise((r) => setTimeout(r, 2000))
      await run()
    } else {
      throw e
    }
  }
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
