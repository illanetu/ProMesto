/**
 * Проверка подключения к локальной и рабочей БД.
 * Локальная: DATABASE_URL_LOCAL или DATABASE_URL
 * Рабочая: DATABASE_URL
 * Запуск: npx tsx scripts/check-both-dbs.ts
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

async function checkOne(_name: string, url: string): Promise<{ ok: boolean; message: string }> {
  const prisma = new PrismaClient({ datasources: { db: { url } } })
  try {
    await prisma.$queryRaw`SELECT 1 as test`
    try {
      const [users, notes, mestos] = await Promise.all([
        prisma.user.count(),
        prisma.note.count(),
        prisma.mesto.count(),
      ])
      await prisma.$disconnect()
      return { ok: true, message: `таблицы: users=${users}, notes=${notes}, mestos=${mestos}` }
    } catch (schemaErr: unknown) {
      const msg = schemaErr instanceof Error ? schemaErr.message : String(schemaErr)
      await prisma.$disconnect().catch(() => {})
      if (msg.includes('does not exist')) return { ok: true, message: 'подключение OK, но таблицы не созданы (выполните: npx prisma migrate deploy)' }
      return { ok: false, message: msg }
    }
  } catch (e) {
    await prisma.$disconnect().catch(() => {})
    return { ok: false, message: e instanceof Error ? e.message : String(e) }
  }
}

async function main() {
  loadEnv()

  const urlLocal = process.env.DATABASE_URL_LOCAL ?? process.env.DATABASE_URL
  const urlProduction = process.env.DATABASE_URL

  console.log('Проверка баз данных:\n')

  if (!urlProduction) {
    console.log('Рабочая БД (DATABASE_URL): не задана')
  } else {
    const res = await checkOne('Рабочая', urlProduction)
    console.log(res.ok ? `Рабочая БД (DATABASE_URL): OK — ${res.message}` : `Рабочая БД (DATABASE_URL): ошибка — ${res.message}`)
  }

  if (!urlLocal) {
    console.log('Локальная БД (DATABASE_URL_LOCAL / DATABASE_URL): не задана')
  } else if (urlLocal === urlProduction) {
    const res = await checkOne('Локальная', urlLocal)
    console.log(res.ok ? `Локальная БД (используется DATABASE_URL): OK — ${res.message}` : `Локальная БД: ошибка — ${res.message}`)
  } else {
    const res = await checkOne('Локальная', urlLocal)
    console.log(res.ok ? `Локальная БД (DATABASE_URL_LOCAL): OK — ${res.message}` : `Локальная БД (DATABASE_URL_LOCAL): ошибка — ${res.message}`)
  }

  console.log('')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
