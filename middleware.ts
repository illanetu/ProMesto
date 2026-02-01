/**
 * Middleware: защита маршрутов /dashboard и /my-prompts.
 * Неавторизованных пользователей Auth.js редиректит на /login (pages.signIn).
 */
import { auth } from "@/auth"

export default auth((req) => {
  // authorized callback в auth.ts уже проверяет защищённые пути и возвращает false → редирект на /login
  return
})

export const config = {
  matcher: [
    // Защищаем только нужные пути; остальные не трогаем
    "/dashboard",
    "/dashboard/:path*",
    "/my-prompts",
    "/my-prompts/:path*",
  ],
}
