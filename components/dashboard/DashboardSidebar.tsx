"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  MessageSquare,
  Bookmark,
  History,
  Settings,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { href: "/dashboard", label: "Места", icon: MessageSquare },
  { href: "/dashboard/public", label: "Публичные места", icon: Globe },
  { href: "/dashboard/favorites", label: "Избранное", icon: Bookmark },
  { href: "/dashboard/history", label: "История", icon: History },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
]

interface DashboardSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex h-full w-[280px] shrink-0 flex-col",
        "bg-gradient-to-b from-sky-50 to-sky-100/80",
        "border-r border-sky-200/60",
        "shadow-sm"
      )}
    >
      {/* Аватар и имя */}
      <div className="flex flex-col items-center gap-3 px-4 py-6">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "Аватар"}
            width={64}
            height={64}
            className="rounded-full border-2 border-white shadow-md"
          />
        ) : (
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full",
              "bg-sky-200 text-sky-700 text-xl font-semibold"
            )}
          >
            {user.name?.[0] ?? user.email?.[0] ?? "?"}
          </div>
        )}
        <p className="text-center text-sm font-medium text-slate-700">
          {user.name ?? "Пользователь"}
        </p>
      </div>

      {/* Меню */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-4">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sky-200/70 text-sky-900 shadow-sm"
                  : "text-slate-600 hover:bg-sky-100/60 hover:text-slate-800"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Выход */}
      <div className="border-t border-sky-200/60 px-3 py-4">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-sky-100/60 hover:text-slate-800"
        >
          Выйти
        </Link>
      </div>
    </aside>
  )
}
