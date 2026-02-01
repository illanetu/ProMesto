/**
 * Диагностика: проверка переменных окружения и таблиц Auth.js в БД.
 * Откройте GET /api/check-auth в браузере, чтобы увидеть причину 500.
 */
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const checks: Record<string, { ok: boolean; message?: string }> = {}

  // Переменные окружения
  checks.AUTH_SECRET = {
    ok: !!process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16,
    message: process.env.AUTH_SECRET ? "задан" : "не задан",
  }
  checks.GOOGLE_CLIENT_ID = {
    ok: !!process.env.GOOGLE_CLIENT_ID,
    message: process.env.GOOGLE_CLIENT_ID ? "задан" : "не задан",
  }
  checks.GOOGLE_CLIENT_SECRET = {
    ok: !!process.env.GOOGLE_CLIENT_SECRET,
    message: process.env.GOOGLE_CLIENT_SECRET ? "задан" : "не задан",
  }
  checks.DATABASE_URL = {
    ok: !!process.env.DATABASE_URL,
    message: process.env.DATABASE_URL ? "задан" : "не задан",
  }

  // Таблицы в БД: пробуем обратиться к таблицам Auth.js
  try {
    await prisma.account.findFirst({ take: 1 })
    checks.table_accounts = { ok: true, message: "существует" }
  } catch (e) {
    checks.table_accounts = {
      ok: false,
      message: (e as Error).message.includes("does not exist")
        ? "таблица accounts не найдена — выполните миграцию (prisma migrate deploy или SQL из 20250201190000_add_authjs_tables)"
        : (e as Error).message,
    }
  }

  try {
    await prisma.session.findFirst({ take: 1 })
    checks.table_sessions = { ok: true, message: "существует" }
  } catch (e) {
    checks.table_sessions = {
      ok: false,
      message: (e as Error).message.includes("does not exist")
        ? "таблица sessions не найдена"
        : (e as Error).message,
    }
  }

  const allOk = Object.values(checks).every((c) => c.ok)
  return NextResponse.json(
    { ok: allOk, checks },
    { status: allOk ? 200 : 500 }
  )
}
