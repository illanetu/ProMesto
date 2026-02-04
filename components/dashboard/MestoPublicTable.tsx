"use client"

import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteMesto } from "@/lib/mesto-actions"
import { LikeButton } from "./LikeButton"
import { MestoDialog } from "./MestoDialog"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Mesto } from "@/generated/prisma"

interface MestoPublicTableProps {
  mestos: (Mesto & { likesCount?: number; likedByMe?: boolean })[]
  userId: string | null
}

function previewText(text: string, maxLen = 80): string {
  const trimmed = text.trim().replace(/\s+/g, " ")
  if (trimmed.length <= maxLen) return trimmed
  return trimmed.slice(0, maxLen) + "…"
}

export function MestoPublicTable({ mestos, userId }: MestoPublicTableProps) {
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [editMesto, setEditMesto] = useState<Mesto | null>(null)
  const router = useRouter()

  const refresh = () => router.refresh()

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить это место?")) return
    setPendingId(id)
    await deleteMesto(id)
    refresh()
    setPendingId(null)
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Название
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Описание
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Лайков
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Дата
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-700">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {mestos.map((m) => {
              const content = m.content ?? m.description ?? ""
              const pending = pendingId === m.id
              const isOwner = userId === m.ownerId
              return (
                <tr
                  key={m.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {m.title}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-slate-500">
                    {previewText(content)}
                  </td>
                  <td className="px-4 py-3">
                    <LikeButton
                      mestoId={m.id}
                      initialLiked={m.likedByMe ?? false}
                      initialCount={m.likesCount ?? 0}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(m.updatedAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {isOwner && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditMesto(m)}
                            disabled={pending}
                            className="h-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="ml-1">Правка</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(m.id)}
                            disabled={pending}
                            className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="ml-1">Удалить</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editMesto && (
        <MestoDialog
          open={!!editMesto}
          onOpenChange={(open) => !open && setEditMesto(null)}
          mesto={editMesto}
          onSuccess={refresh}
        />
      )}
    </>
  )
}
