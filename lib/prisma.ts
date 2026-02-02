import { PrismaClient } from '@/generated/prisma'

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 300

function isRetryableError(e: unknown): boolean {
  if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P1017') return true
  if (e instanceof Error) {
    const msg = e.message
    if (/server has closed the connection|connection.*reset|удаленный хост/i.test(msg)) return true
    if (/timed out fetching a new connection|connection pool/i.test(msg)) return true
  }
  return false
}

function createPrisma() {
  const base = new PrismaClient({
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
