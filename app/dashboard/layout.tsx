/**
 * Layout личного кабинета: двухколоночная компоновка.
 * Слева — сайдбар, справа — контент.
 * Защита: неавторизованных редирект на /login.
 */
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import Link from "next/link"

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

  return (
    <div className="flex min-h-screen bg-slate-100">
      <DashboardSidebar user={session.user} />
      <main className="flex flex-1 flex-col overflow-auto bg-white">
        {children}
      </main>
    </div>
  )
}
