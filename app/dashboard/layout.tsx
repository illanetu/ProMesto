/**
 * Защита /dashboard: неавторизованных редирект на /login.
 * В Next.js 16 проверка auth в layout (proxy не используется для auth).
 */
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }
  return <>{children}</>
}
