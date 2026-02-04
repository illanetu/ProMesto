/**
 * POST /api/mestos/[id]/like — toggle лайка.
 * Идемпотентный по смыслу: повторный запрос меняет состояние.
 * Только авторизованные; только public mesto.
 */

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: mestoId } = await params

  let session
  try {
    session = await auth()
  } catch {
    return NextResponse.json(
      { error: "Ошибка авторизации. Попробуйте позже." },
      { status: 500 }
    )
  }

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Войдите, чтобы поставить лайк" },
      { status: 401 }
    )
  }

  try {
    const mesto = await prisma.mesto.findUnique({ where: { id: mestoId } })
    if (!mesto) {
      return NextResponse.json({ error: "Место не найдено" }, { status: 404 })
    }
    if (mesto.visibility !== "PUBLIC") {
      return NextResponse.json(
        { error: "Лайкать можно только публичные места" },
        { status: 400 }
      )
    }

    const existing = await prisma.like.findUnique({
      where: {
        userId_mestoId: { userId: session.user.id, mestoId },
      },
    })

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } })
    } else {
      await prisma.like.create({
        data: { userId: session.user.id, mestoId },
      })
    }

    const likesCount = await prisma.like.count({
      where: { mestoId },
    })

    return NextResponse.json({
      liked: !existing,
      likesCount,
    })
  } catch (e) {
    console.error("[POST /api/mestos/[id]/like]", e)
    return NextResponse.json(
      { error: "Попробуйте позже" },
      { status: 500 }
    )
  }
}
