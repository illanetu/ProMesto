"use client"

import { cn } from "@/lib/utils"
import { LayoutGrid, Table2 } from "lucide-react"

export type ViewMode = "cards" | "table"

interface ViewToggleProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      <button
        type="button"
        onClick={() => onChange("cards")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          value === "cards"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-slate-600 hover:text-slate-800"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Карточки
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          value === "table"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-slate-600 hover:text-slate-800"
        )}
      >
        <Table2 className="h-4 w-4" />
        Таблица
      </button>
    </div>
  )
}
