import { PrismaClient } from '@/generated/prisma'
import { TABLE_CONFIG, TABLE_KEYS, type TableKey, type ViewDbEnv } from './view-db-config'

export { TABLE_CONFIG, TABLE_KEYS, type TableKey, type ViewDbEnv }

const clientCache = new Map<string, PrismaClient>()

function getDatabaseUrl(env: ViewDbEnv): string {
  if (env === 'local') {
    const url = process.env.DATABASE_URL_LOCAL ?? process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL_LOCAL или DATABASE_URL не заданы')
    return url
  }
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL не задан')
  return url
}

export function getViewDbPrisma(env: ViewDbEnv): PrismaClient {
  const cached = clientCache.get(env)
  if (cached) return cached
  const url = getDatabaseUrl(env)
  const client = new PrismaClient({
    datasources: { db: { url } },
    log: ['error'],
  })
  clientCache.set(env, client)
  return client
}
