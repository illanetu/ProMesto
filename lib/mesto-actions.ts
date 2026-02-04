"use server"

/**
 * Server Actions для CRUD Mesto.
 * Проверка прав: пользователь может изменять/удалять только свои места.
 */

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const mestoFormSchema = z.object({
  title: z.string().min(1, "Введите название").max(200),
  content: z.string().min(1, "Введите описание").max(5000),
  isPublic: z.boolean(),
})

export type MestoFormData = z.infer<typeof mestoFormSchema>

export async function createMesto(data: MestoFormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Необходима авторизация" }
  }
  const parsed = mestoFormSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" }
  }
  try {
    await prisma.mesto.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        visibility: parsed.data.isPublic ? "PUBLIC" : "PRIVATE",
        ownerId: session.user.id,
      },
    })
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/public")
    revalidatePath("/dashboard/favorites")
    return { success: true }
  } catch (e) {
    console.error("[createMesto]", e)
    return { error: "Не удалось создать место" }
  }
}

export async function updateMesto(id: string, data: MestoFormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Необходима авторизация" }
  }
  const parsed = mestoFormSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" }
  }
  // Проверка прав: только владелец может редактировать
  const existing = await prisma.mesto.findUnique({ where: { id } })
  if (!existing || existing.ownerId !== session.user.id) {
    return { error: "Нет прав на редактирование" }
  }
  try {
    await prisma.mesto.update({
      where: { id },
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        visibility: parsed.data.isPublic ? "PUBLIC" : "PRIVATE",
      },
    })
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/public")
    revalidatePath("/dashboard/favorites")
    return { success: true }
  } catch (e) {
    console.error("[updateMesto]", e)
    return { error: "Не удалось обновить место" }
  }
}

export async function deleteMesto(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Необходима авторизация" }
  }
  const existing = await prisma.mesto.findUnique({ where: { id } })
  if (!existing || existing.ownerId !== session.user.id) {
    return { error: "Нет прав на удаление" }
  }
  try {
    await prisma.mesto.delete({ where: { id } })
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/public")
    revalidatePath("/dashboard/favorites")
    return { success: true }
  } catch (e) {
    console.error("[deleteMesto]", e)
    return { error: "Не удалось удалить место" }
  }
}

export async function togglePublicMesto(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Необходима авторизация" }
  }
  const existing = await prisma.mesto.findUnique({ where: { id } })
  if (!existing || existing.ownerId !== session.user.id) {
    return { error: "Нет прав" }
  }
  const newVisibility = existing.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC"
  try {
    await prisma.mesto.update({
      where: { id },
      data: { visibility: newVisibility },
    })
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/public")
    revalidatePath("/dashboard/favorites")
    return { success: true, isPublic: newVisibility === "PUBLIC" }
  } catch (e) {
    console.error("[togglePublicMesto]", e)
    return { error: "Не удалось изменить видимость" }
  }
}

export async function toggleFavoriteMesto(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Необходима авторизация" }
  }
  const existing = await prisma.mesto.findUnique({ where: { id } })
  if (!existing) {
    return { error: "Место не найдено" }
  }
  // Избранное может переключать только владелец
  if (existing.ownerId !== session.user.id) {
    return { error: "Нет прав" }
  }
  try {
    const updated = await prisma.mesto.update({
      where: { id },
      data: { isFavorite: !existing.isFavorite },
    })
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/public")
    revalidatePath("/dashboard/favorites")
    return { success: true, isFavorite: updated.isFavorite }
  } catch (e) {
    console.error("[toggleFavoriteMesto]", e)
    return { error: "Не удалось изменить избранное" }
  }
}
