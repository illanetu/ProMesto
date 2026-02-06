"use client"

import { MessageSquare, Star, Pencil, Trash2, Globe, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  toggleFavoriteMesto,
  togglePublicMesto,
  deleteMesto,
} from "@/lib/mesto-actions"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { MestoDialog } from "./MestoDialog"
import { LikeButton } from "./LikeButton"
import { useState } from "react"
import type { Mesto } from "@/generated/prisma"

interface MestoCardProps {
  mesto: Mesto & { likesCount?: number; likedByMe?: boolean }
  isOwner: boolean
  showDelete?: boolean
  showLike?: boolean
  variant?: "default" | "compact"
}

function previewText(text: string, maxLen = 120): string {
  const trimmed = text.trim().replace(/\s+/g, " ")
  if (trimmed.length <= maxLen) return trimmed
  return trimmed.slice(0, maxLen) + "…"
}

export function MestoCard({ mesto, isOwner, showDelete = true, showLike, variant = "default" }: MestoCardProps) {
  const [pending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const router = useRouter()
  const content = mesto.content ?? mesto.description ?? ""
  const preview = previewText(content)

  const refresh = () => {
    startTransition(() => router.refresh())
  }

  const handleToggleFavorite = () => {
    startTransition(async () => {
      await toggleFavoriteMesto(mesto.id)
      refresh()
    })
  }

  const handleTogglePublic = () => {
    startTransition(async () => {
      await togglePublicMesto(mesto.id)
      refresh()
    })
  }

  const handleDelete = () => {
    if (!confirm("Удалить это место?")) return
    startTransition(async () => {
      await deleteMesto(mesto.id)
      refresh()
    })
  }

  const isCompact = variant === "compact"

  return (
    <>
      <div
        className={cn(
          "min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md",
          isCompact ? "flex flex-col p-4" : "flex items-start gap-3 p-4"
        )}
      >
        <div className={cn("min-w-0 flex-1", isCompact ? "flex flex-col gap-3" : "flex items-start gap-3")}>
          {!isCompact && (
            <div className="mt-0.5 shrink-0 rounded-full bg-slate-100 p-2">
              <MessageSquare className="h-4 w-4 text-slate-600" />
            </div>
          )}
          <div className={cn("min-w-0 flex-1", isCompact && "space-y-1")}>
            <div className="flex min-w-0 items-center gap-1.5">
              <h3 className="min-w-0 truncate font-semibold text-slate-900" title={mesto.title}>{mesto.title}</h3>
              {isCompact && mesto.visibility === "PUBLIC" && (
                <span title="Публичное">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                </span>
              )}
              {isCompact && mesto.isFavorite && (
                <span title="В избранном">
                  <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" />
                </span>
              )}
            </div>
            <p className={cn("text-sm text-slate-500", isCompact ? "line-clamp-2" : "mt-1 line-clamp-2")}>
              {preview}
            </p>
            {isCompact && (
              <p className="text-xs text-slate-400">
                {new Date(mesto.updatedAt).toLocaleDateString("ru-RU")}
              </p>
            )}
          </div>
        </div>

        {/* Действия */}
        <div className={cn(
          "flex shrink-0 flex-wrap items-center gap-1",
          isCompact && "mt-3 border-t border-slate-100 pt-3"
        )}>
          {showLike && mesto.visibility === "PUBLIC" && (
            <LikeButton
              mestoId={mesto.id}
              initialLiked={mesto.likedByMe ?? false}
              initialCount={mesto.likesCount ?? 0}
            />
          )}
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              disabled={pending}
              className={cn(
                "h-8 w-8",
                mesto.isFavorite && "text-amber-500 hover:text-amber-600"
              )}
              title={mesto.isFavorite ? "Убрать из избранного" : "В избранное"}
            >
              <Star
                className={cn("h-4 w-4", mesto.isFavorite && "fill-current")}
              />
            </Button>
          )}
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTogglePublic}
              disabled={pending}
              className="h-8 w-8"
              title={mesto.visibility === "PUBLIC" ? "Сделать приватным" : "Сделать публичным"}
            >
              {mesto.visibility === "PUBLIC" ? (
                <Globe className="h-4 w-4 text-emerald-600" />
              ) : (
                <Lock className="h-4 w-4 text-slate-500" />
              )}
            </Button>
          )}
          {isOwner && (
            <Button
              variant="ghost"
              size={isCompact ? "sm" : "icon"}
              onClick={() => setEditOpen(true)}
              disabled={pending}
              className={cn(
                isCompact && "h-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              )}
              title="Редактировать"
            >
              <Pencil className={cn("h-4 w-4", isCompact && "h-3.5 w-3.5")} />
              {isCompact && <span className="ml-1">Правка</span>}
            </Button>
          )}
          {isOwner && showDelete && (
            <Button
              variant="ghost"
              size={isCompact ? "sm" : "icon"}
              onClick={handleDelete}
              disabled={pending}
              className={cn(
                "text-red-600 hover:bg-red-50 hover:text-red-700",
                !isCompact && "h-8 w-8"
              )}
              title="Удалить"
            >
              <Trash2 className={cn("h-4 w-4", isCompact && "h-3.5 w-3.5")} />
              {isCompact && <span className="ml-1">Удалить</span>}
            </Button>
          )}
        </div>
      </div>

      {editOpen && (
        <MestoDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          mesto={mesto}
          onSuccess={refresh}
        />
      )}
    </>
  )
}
