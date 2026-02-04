/**
 * Серверные запросы для получения списка Mesto.
 * Используются на страницах dashboard.
 */

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const PAGE_SIZE = 10

async function getSession() {
  try {
    return await auth()
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[mesto-queries] auth() failed:", e)
    }
    return null
  }
}

export async function getMyMestos(opts?: {
  search?: string
  page?: number
}) {
  const session = await getSession()
  if (!session?.user?.id) return { mestos: [], total: 0, page: 1, pageSize: PAGE_SIZE }

  const search = opts?.search?.trim() ?? ""
  const page = Math.max(1, opts?.page ?? 1)
  const skip = (page - 1) * PAGE_SIZE

  const where = {
    ownerId: session.user.id,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { content: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  try {
    const [mestos, total] = await Promise.all([
      prisma.mesto.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.mesto.count({ where }),
    ])
    return { mestos, total, page, pageSize: PAGE_SIZE }
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[getMyMestos]", e)
    }
    return { mestos: [], total: 0, page: 1, pageSize: PAGE_SIZE }
  }
}

export async function getPublicMestos(opts?: {
  search?: string
  page?: number
}) {
  const session = await getSession()
  const search = opts?.search?.trim() ?? ""
  const page = Math.max(1, opts?.page ?? 1)
  const skip = (page - 1) * PAGE_SIZE

  const where = {
    visibility: "PUBLIC" as const,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { content: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  try {
    const [mestos, total] = await Promise.all([
      prisma.mesto.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.mesto.count({ where }),
    ])
    return {
      mestos,
      total,
      page,
      pageSize: PAGE_SIZE,
      userId: session?.user?.id ?? null,
    }
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[getPublicMestos]", e)
    }
    return {
      mestos: [],
      total: 0,
      page,
      pageSize: PAGE_SIZE,
      userId: null,
    }
  }
}

export async function getFavoriteMestos(opts?: {
  search?: string
  page?: number
}) {
  const session = await getSession()
  if (!session?.user?.id) return { mestos: [], total: 0, page: 1, pageSize: PAGE_SIZE }

  const search = opts?.search?.trim() ?? ""
  const page = Math.max(1, opts?.page ?? 1)
  const skip = (page - 1) * PAGE_SIZE

  const where = {
    ownerId: session.user.id,
    isFavorite: true,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { content: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  try {
    const [mestos, total] = await Promise.all([
      prisma.mesto.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.mesto.count({ where }),
    ])
    return { mestos, total, page, pageSize: PAGE_SIZE }
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[getFavoriteMestos]", e)
    }
    return { mestos: [], total: 0, page: 1, pageSize: PAGE_SIZE }
  }
}
