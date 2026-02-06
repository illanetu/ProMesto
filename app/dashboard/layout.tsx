/**
 * Layout личного кабинета: двухколоночная компоновка.
 * Слева — сайдбар, справа — контент. На мобильном сайдбар — выдвижное меню.
 * Защита: неавторизованных редирект на /login.
 */
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

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

  return <DashboardShell user={session.user}>{children}</DashboardShell>
}
