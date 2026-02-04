"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SearchInput } from "./SearchInput"
import { MestoDialog } from "./MestoDialog"
import Link from "next/link"

interface MestoListHeaderProps {
  showCreate?: boolean
  total: number
  totalPages: number
  currentPage: number
  basePath: string
}

export function MestoListHeader({
  showCreate,
  total,
  totalPages,
  currentPage,
  basePath,
}: MestoListHeaderProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const searchParams = useSearchParams()
  const q = searchParams.get("q") ?? ""

  const pageUrl = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    params.set("page", String(p))
    return `${basePath}?${params.toString()}`
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      <div className="min-w-[200px] max-w-sm flex-1">
        <SearchInput placeholder="Поиск по названию или описанию…" />
      </div>
      {showCreate && (
        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          Новое место
        </Button>
      )}
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
      {createOpen && (
        <MestoDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  )
}
