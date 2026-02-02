/**
 * Защита /my-prompts: неавторизованных редирект на /login.
 * При ошибке БД/адаптера (разрыв соединения и т.п.) тоже редирект на /login, чтобы не показывать AdapterError.
 */
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function MyPromptsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null
  try {
    session = await auth()
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[my-prompts layout] auth() failed, redirecting to /login:", e)
    }
    redirect("/login")
  }
  if (!session?.user) {
    redirect("/login")
  }
  return <>{children}</>
}
