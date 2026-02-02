import { PrismaClient } from '@/generated/prisma'

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 300

/** На Vercel используем Neon serverless-драйвер (HTTP/WebSocket), чтобы избежать разрыва TCP-соединения. */
function createNeonAdapter(): InstanceType<typeof import('@prisma/adapter-neon').PrismaNeon> | undefined {
  if (typeof process.env.VERCEL === 'undefined' || !process.env.DATABASE_URL) return undefined
  try {
    const { neonConfig } = require('@neondatabase/serverless')
    const { PrismaNeon } = require('@prisma/adapter-neon')
    const ws = require('ws')
    neonConfig.webSocketConstructor = ws
    return new PrismaNeon({ connectionString: process.env.DATABASE_URL })
  } catch {
    return undefined
  }
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    const parts = [e.message]
    const cause = (e as { cause?: unknown }).cause
    if (cause instanceof Error) parts.push(cause.message)
    else if (cause && typeof cause === 'object' && 'message' in cause) parts.push(String((cause as { message: unknown }).message))
    return parts.join(' ')
  }
  return String(e)
}

function isRetryableError(e: unknown): boolean {
  if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P1017') return true
  const msg = getErrorMessage(e)
  if (/server has closed the connection|connection.*reset|удаленный хост|connection reset|ECONNRESET/i.test(msg)) return true
  if (/timed out fetching a new connection|connection pool/i.test(msg)) return true
  return false
}

function createPrisma() {
  const adapter = createNeonAdapter()
  // Сгенерированные типы PrismaClient не включают adapter; runtime его поддерживает (driver adapters).
  const base = adapter
    ? new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      } as ConstructorParameters<typeof PrismaClient>[0])
    : new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
  return base.$extends({
    name: 'retryOnConnectionError',
    query: {
      $allOperations({ operation, model, args, query }) {
        const run = (attempt: number): Promise<unknown> =>
          query(args).catch((e: unknown) => {
            if (isRetryableError(e) && attempt < MAX_RETRIES) {
              return new Promise<unknown>((resolve, reject) => {
                setTimeout(() => run(attempt + 1).then(resolve).catch(reject), RETRY_DELAY_MS)
              })
            }
            throw e
          })
        return run(0) as ReturnType<typeof query>
      },
    },
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrisma> | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
