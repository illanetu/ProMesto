/**
 * Обработчик Auth.js: все запросы к /api/auth/* (signin, signout, callback, session и т.д.)
 * В dev при 500 возвращаем текст ошибки для диагностики.
 */
import { handlers } from "@/auth"
import { NextResponse } from "next/server"

async function wrap(handler: (req: Request) => Promise<Response>, req: Request) {
  try {
    return await handler(req)
  } catch (e) {
    console.error("[auth] 500:", e)
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        { error: "Auth error", message: (e as Error).message, cause: (e as Error).cause },
        { status: 500 }
      )
    }
    throw e
  }
}

export async function GET(req: Request) {
  return wrap(handlers.GET, req)
}

export async function POST(req: Request) {
  return wrap(handlers.POST, req)
}
