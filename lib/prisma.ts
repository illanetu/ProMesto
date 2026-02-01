import { PrismaClient } from '@/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const log = process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  const url = process.env.DATABASE_URL

  // Neon: используем serverless driver (WebSocket), чтобы избежать ConnectionReset при OAuth
  if (url?.includes('neon.tech')) {
    const { neonConfig } = require('@neondatabase/serverless')
    const { PrismaNeon } = require('@prisma/adapter-neon')
    const ws = require('ws')
    neonConfig.webSocketConstructor = ws
    const adapter = new PrismaNeon({ connectionString: url })
    return new PrismaClient({ adapter, log })
  }

  return new PrismaClient({ log })
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
