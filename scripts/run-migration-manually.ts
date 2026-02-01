/**
 * Применяет миграцию напрямую через PostgreSQL (без Prisma migrate),
 * чтобы обойти P1002 (advisory lock timeout).
 * Запуск: npm run db:migrate-manual
 */
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { Client } from 'pg'

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

async function main() {
  loadEnv()
  const useLocal = process.argv.includes('--local')
  const url = useLocal ? process.env.DATABASE_URL_LOCAL : process.env.DATABASE_URL
  const label = useLocal ? 'локальная (DATABASE_URL_LOCAL)' : 'рабочая (DATABASE_URL)'
  if (!url) {
    console.error(useLocal ? 'DATABASE_URL_LOCAL не задан в .env' : 'DATABASE_URL не задан в .env')
    process.exit(1)
  }

  const sqlPath = resolve(process.cwd(), 'scripts', 'apply-migration-manually-idempotent.sql')
  const sql = readFileSync(sqlPath, 'utf-8')

  const client = new Client({ connectionString: url })
  try {
    await client.connect()
    console.log(`Подключение к БД (${label}) установлено. Выполняю миграцию...`)
    await client.query(sql)
    console.log('Миграция применена успешно.')
  } catch (e) {
    console.error('Ошибка:', e instanceof Error ? e.message : e)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
