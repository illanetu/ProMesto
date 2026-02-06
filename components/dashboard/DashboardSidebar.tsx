"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  User,
  MessageSquare,
  Globe,
  Star,
  FileText,
  History,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { href: "/dashboard/profile", label: "Профиль", icon: User },
  { href: "/dashboard", label: "Мои места", icon: MessageSquare },
  { href: "/dashboard/public", label: "Публичные места", icon: Globe },
  { href: "/dashboard/favorites", label: "Избранное", icon: Star },
  { href: "/dashboard/notes", label: "Заметки", icon: FileText },
  { href: "/dashboard/history", label: "История", icon: History },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
]

interface DashboardSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  open?: boolean
  onClose?: () => void
}

export function DashboardSidebar({
  user,
  open = false,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname()

  const content = (
    <>
      {/* Аватар и имя — сверху */}
      <div className="flex flex-col items-center gap-2 border-b border-slate-200 pl-6 pr-4 py-6">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "Аватар"}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div
            className={cn(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-full",
              "bg-slate-200 text-slate-600 text-xl font-semibold"
            )}
          >
            {user.name?.[0] ?? user.email?.[0] ?? "?"}
          </div>
        )}
        <span className="text-center text-sm font-medium text-slate-700">
          {user.name ?? "Пользователь"}
        </span>
      </div>

      {/* Меню — под аватаром */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-auto pl-5 pr-3 py-4">
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
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", isActive && "text-blue-600")}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Выход — внизу */}
      <div className="border-t border-slate-200 pl-5 pr-3 py-4">
        <Link
          href="/api/auth/signout"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
        >
          Выйти
        </Link>
      </div>
    </>
  )

  return (
    <aside
      className={cn(
        "flex h-full w-[280px] shrink-0 flex-col bg-white border-r border-slate-200",
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out md:relative md:translate-x-0 md:z-auto",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {content}
    </aside>
  )
}
