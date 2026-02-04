import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function NotesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  let notes: { id: string; title: string; createdAt: Date }[] = []
  try {
    notes = await prisma.note.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, createdAt: true },
    })
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[NotesPage]", e)
    }
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <h1 className="text-2xl font-bold text-slate-900">Личный кабинет</h1>
      <h2 className="mt-2 text-lg font-medium text-slate-600">Заметки</h2>

      {notes.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-slate-600">Заметок пока нет</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <h3 className="font-semibold text-slate-900">{note.title}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {new Date(note.createdAt).toLocaleString("ru-RU")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
