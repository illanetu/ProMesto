'use server'

import { getViewDbPrisma, TABLE_CONFIG, TABLE_KEYS, type TableKey, type ViewDbEnv } from '@/lib/view-db-prisma'

const PAGE_SIZE = 10

export async function getTables(env: ViewDbEnv) {
  try {
    await getViewDbPrisma(env).$connect()
  } catch (e) {
    return { ok: false as const, error: (e as Error).message, tables: [] }
  }
  const tables = TABLE_KEYS.map((key) => ({ key, label: TABLE_CONFIG[key].label }))
  return { ok: true as const, tables, error: null }
}

export async function getTableData(
  env: ViewDbEnv,
  tableKey: TableKey,
  page: number
) {
  try {
    const prisma = getViewDbPrisma(env)
    const config = TABLE_CONFIG[tableKey]
    const delegate = prisma[config.model] as { findMany: (args: { skip: number; take: number }) => Promise<unknown[]>; count: () => Promise<number> }
    const skip = (page - 1) * PAGE_SIZE
    const [data, total] = await Promise.all([
      delegate.findMany({ skip, take: PAGE_SIZE }),
      delegate.count(),
    ])
    return { ok: true as const, data, total, pageSize: PAGE_SIZE, error: null }
  } catch (e) {
    return { ok: false as const, data: [], total: 0, pageSize: PAGE_SIZE, error: (e as Error).message }
  }
}

export async function createRecord(env: ViewDbEnv, tableKey: TableKey, data: Record<string, unknown>) {
  try {
    const prisma = getViewDbPrisma(env)
    const config = TABLE_CONFIG[tableKey]
    const delegate = prisma[config.model] as { create: (args: { data: Record<string, unknown> }) => Promise<unknown> }
    await delegate.create({ data })
    return { ok: true as const, error: null }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function updateRecord(env: ViewDbEnv, tableKey: TableKey, id: string, data: Record<string, unknown>) {
  try {
    const prisma = getViewDbPrisma(env)
    const config = TABLE_CONFIG[tableKey]
    const delegate = prisma[config.model] as { update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown> }
    await delegate.update({ where: { id }, data })
    return { ok: true as const, error: null }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function deleteRecord(env: ViewDbEnv, tableKey: TableKey, id: string) {
  try {
    const prisma = getViewDbPrisma(env)
    const config = TABLE_CONFIG[tableKey]
    const delegate = prisma[config.model] as { delete: (args: { where: { id: string } }) => Promise<unknown> }
    await delegate.delete({ where: { id } })
    return { ok: true as const, error: null }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export { TABLE_CONFIG, type TableKey, type ViewDbEnv }
