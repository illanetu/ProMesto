"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { DashboardSidebar } from "./DashboardSidebar"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  children: React.ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Backdrop на мобильном — закрывает меню по тапу */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <DashboardSidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden bg-white">
        {/* Верхняя полоса на мобильном: кнопка меню */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white pl-6 pr-4 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Открыть меню"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-sm font-semibold text-slate-800">ProMesto</span>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
