/**
 * Конфигурация Auth.js (NextAuth v5):
 * - OAuth Google
 * - Prisma adapter (сессии в БД, стабильный userId)
 * - При первом входе пользователь создаётся в БД через adapter
 */
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { PrismaClient } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// PrismaAdapter типизирован под @prisma/client; наш клиент из generated/prisma с $extends — приводим через unknown
export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma as unknown as PrismaClient),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
    updateAge: 24 * 60 * 60,   // обновлять раз в сутки
  },
  pages: {
    signIn: "/login",
    error: "/auth-error",
  },
  callbacks: {
    // Сессия из БД уже содержит user; при необходимости можно расширить
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
    // Middleware: неавторизованных редиректить на pages.signIn (/login)
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const path = nextUrl.pathname
      const isProtected =
        path === "/" ||
        path.startsWith("/dashboard") ||
        path.startsWith("/my-prompts")
      if (isProtected && !isLoggedIn) return false
      return true
    },
  },
  trustHost: true,
})

export const { GET, POST } = handlers
