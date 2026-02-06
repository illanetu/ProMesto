/**
 * Серверные запросы для получения списка Mesto.
 * Используются на страницах dashboard.
 */

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { Mesto } from "@/generated/prisma"

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

export type PublicMestoWithLikes = Awaited<
  ReturnType<typeof getPublicMestos>
>["mestos"][number]

export async function getPublicMestos(opts?: {
  search?: string
  page?: number
  sort?: "popular" | "recent"
}) {
  const session = await getSession()
  const search = opts?.search?.trim() ?? ""
  const page = Math.max(1, opts?.page ?? 1)
  const skip = (page - 1) * PAGE_SIZE
  const sort = opts?.sort ?? "recent"

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

  type MestoWithLikesMeta = Mesto & {
    _count: { likes: number }
    likes?: { id: string }[]
  }

  try {
    let mestos: MestoWithLikesMeta[]
    const total = await prisma.mesto.count({ where })

    if (sort === "popular") {
      // Для сортировки по популярности используем raw SQL с JOIN
      let rawMestos: Array<{ id: string }>
      
      if (search) {
        rawMestos = await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT m.id
          FROM mestos m
          LEFT JOIN likes l ON m.id = l.mesto_id
          WHERE m.visibility = 'PUBLIC' 
            AND (m.title ILIKE ${`%${search}%`} OR m.content ILIKE ${`%${search}%`})
          GROUP BY m.id
          ORDER BY COUNT(l.id) DESC, m.created_at DESC
          LIMIT ${PAGE_SIZE} OFFSET ${skip}
        `
      } else {
        rawMestos = await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT m.id
          FROM mestos m
          LEFT JOIN likes l ON m.id = l.mesto_id
          WHERE m.visibility = 'PUBLIC'
          GROUP BY m.id
          ORDER BY COUNT(l.id) DESC, m.created_at DESC
          LIMIT ${PAGE_SIZE} OFFSET ${skip}
        `
      }

      const mestoIds = rawMestos.map((m) => m.id)
      
      if (mestoIds.length === 0) {
        mestos = []
      } else {
        mestos = await prisma.mesto.findMany({
          where: {
            ...where,
            id: { in: mestoIds },
          },
          include: {
            _count: { select: { likes: true } },
            likes:
              session?.user?.id != null
                ? {
                    where: { userId: session.user.id },
                    select: { id: true },
                  }
                : false,
          },
        })

        // Сохраняем порядок из raw запроса
        const orderMap = new Map(mestoIds.map((id, idx) => [id, idx]))
        mestos.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
      }
    } else {
      mestos = await prisma.mesto.findMany({
        where,
        orderBy: { createdAt: "desc" as const },
        skip,
        take: PAGE_SIZE,
        include: {
          _count: { select: { likes: true } },
          likes:
            session?.user?.id != null
              ? {
                  where: { userId: session.user.id },
                  select: { id: true },
                }
              : false,
        },
      })
    }

    const mestosWithMeta = mestos.map((m) => {
      const { _count, ...rest } = m
      const likes = "likes" in m ? (m as { likes?: { id: string }[] }).likes : undefined
      return {
        ...rest,
        likesCount: _count.likes,
        likedByMe: Array.isArray(likes) && likes.length > 0,
      }
    })

    return {
      mestos: mestosWithMeta,
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
