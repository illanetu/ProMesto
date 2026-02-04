"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SearchInput } from "./SearchInput"
import { MestoDialog } from "./MestoDialog"
import { MestoCard } from "./MestoCard"
import { MestoTable } from "./MestoTable"
import { ViewToggle, type ViewMode } from "./ViewToggle"
import Link from "next/link"
import type { Mesto } from "@/generated/prisma"

interface MestoMyPlacesViewProps {
  mestos: (Mesto & { likesCount?: number; likedByMe?: boolean })[]
  total: number
  pageSize: number
  currentPage: number
}

export function MestoMyPlacesView({
  mestos,
  total,
  pageSize,
  currentPage,
}: MestoMyPlacesViewProps) {
  const [view, setView] = useState<ViewMode>("cards")
  const [createOpen, setCreateOpen] = useState(false)
  const searchParams = useSearchParams()
  const q = searchParams.get("q") ?? ""
  const totalPages = Math.ceil(total / pageSize)

  const pageUrl = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    params.set("page", String(p))
    return `/dashboard?${params.toString()}`
  }

  return (
    <>
      {/* Заголовок: Мои места + Кнопка создать */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Мои места
        </h1>
        <Button
          onClick={() => setCreateOpen(true)}
          className="w-fit shrink-0 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Создать место
        </Button>
      </div>

      {/* Поиск, переключатель вида, пагинация */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="min-w-[200px] max-w-sm flex-1">
          <SearchInput placeholder="Поиск по названию или описанию…" />
        </div>
        <ViewToggle value={view} onChange={setView} />
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Всего: {total}</span>
          {totalPages > 1 && (
            <span className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={pageUrl(p)}
                  className={
                    p === currentPage
                      ? "font-semibold text-slate-800"
                      : "hover:text-slate-700"
                  }
                >
                  {p}
                </Link>
              ))}
            </span>
          )}
        </div>
      </div>

      {/* Контент */}
      {mestos.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-slate-600">
            У вас пока нет записей мест — создайте первую
          </p>
        </div>
      ) : view === "cards" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mestos.map((m) => (
            <MestoCard
              key={m.id}
              mesto={m}
              isOwner
              showDelete
              variant="compact"
            />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <MestoTable mestos={mestos} isOwner />
        </div>
      )}

      {createOpen && (
        <MestoDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  )
}
