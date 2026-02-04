import { auth } from "@/auth"
import Image from "next/image"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await auth()
  const user = session?.user

  if (!user) redirect("/login")

  return (
    <div className="flex flex-1 flex-col p-6">
      <h1 className="text-2xl font-bold text-slate-900">Личный кабинет</h1>
      <h2 className="mt-2 text-lg font-medium text-slate-600">Профиль</h2>

      <div className="mt-8 flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "Аватар"}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-200 text-2xl font-semibold text-slate-600"
            >
              {user.name?.[0] ?? user.email?.[0] ?? "?"}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {user.name ?? "Без имени"}
            </p>
            <p className="text-slate-600">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
