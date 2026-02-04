/**
 * Middleware: защита маршрутов. Неавторизованных редирект на /login.
 * authorized callback в auth.ts возвращает false для /, /dashboard, /my-prompts.
 */
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  return NextResponse.next()
})

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/my-prompts/:path*",
  ],
}
