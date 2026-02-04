"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { SearchInput } from "./SearchInput"
import { MestoCard } from "./MestoCard"
import { MestoPublicTable } from "./MestoPublicTable"
import { ViewToggle, type ViewMode } from "./ViewToggle"
import Link from "next/link"
import type { Mesto } from "@/generated/prisma"

interface MestoPublicPlacesViewProps {
  mestos: (Mesto & { likesCount?: number; likedByMe?: boolean })[]
  total: number
  pageSize: number
  currentPage: number
  userId: string | null
  sort: "popular" | "recent"
}

export function MestoPublicPlacesView({
  mestos,
  total,
  pageSize,
  currentPage,
  userId,
  sort,
}: MestoPublicPlacesViewProps) {
  const [view, setView] = useState<ViewMode>("cards")
  const searchParams = useSearchParams()
  const q = searchParams.get("q") ?? ""
  const totalPages = Math.ceil(total / pageSize)

  const pageUrl = (p: number, sortVal?: "popular" | "recent") => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    params.set("page", String(p))
    params.set("sort", sortVal ?? sort)
    return `/dashboard/public?${params.toString()}`
  }

  return (
    <>
      {/* Заголовок */}
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Публичные места
      </h1>

      {/* Поиск, сортировка, переключатель вида, пагинация */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="min-w-[200px] max-w-sm flex-1">
          <SearchInput placeholder="Поиск по названию или описанию…" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Сортировка:</span>
          <Link
            href={pageUrl(1, "popular")}
            className={
              sort === "popular"
                ? "font-semibold text-slate-800"
                : "text-slate-600 hover:text-slate-800"
            }
          >
            По популярности
          </Link>
          <Link
            href={pageUrl(1, "recent")}
            className={
              sort === "recent"
                ? "font-semibold text-slate-800"
                : "text-slate-600 hover:text-slate-800"
            }
          >
            По дате
          </Link>
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
          <p className="text-slate-600">Публичных мест пока нет</p>
        </div>
      ) : view === "cards" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mestos.map((m) => (
            <MestoCard
              key={m.id}
              mesto={m}
              isOwner={userId === m.ownerId}
              showDelete={userId === m.ownerId}
              showLike
              variant="compact"
            />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <MestoPublicTable mestos={mestos} userId={userId} />
        </div>
      )}
    </>
  )
}
