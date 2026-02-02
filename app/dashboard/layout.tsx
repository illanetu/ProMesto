/**
 * Защита /dashboard: неавторизованных редирект на /login.
 * При ошибке БД/адаптера (разрыв соединения) редирект на /login.
 */
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null
  try {
    session = await auth()
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[dashboard layout] auth() failed, redirecting to /login:", e)
    }
    redirect("/login")
  }
  if (!session?.user) {
    redirect("/login")
  }
  return <>{children}</>
}
