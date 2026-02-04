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
}

function previewText(text: string, maxLen = 120): string {
  const trimmed = text.trim().replace(/\s+/g, " ")
  if (trimmed.length <= maxLen) return trimmed
  return trimmed.slice(0, maxLen) + "…"
}

export function MestoCard({ mesto, isOwner, showDelete = true, showLike }: MestoCardProps) {
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

  return (
    <>
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
          "transition-shadow hover:shadow-md"
        )}
      >
        {/* Иконка чата */}
        <div className="mt-0.5 shrink-0 rounded-full bg-slate-100 p-2">
          <MessageSquare className="h-4 w-4 text-slate-600" />
        </div>

        {/* Контент */}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">{mesto.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{preview}</p>
        </div>

        {/* Действия */}
        <div className="flex shrink-0 flex-wrap items-center gap-1">
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
              size="icon"
              onClick={() => setEditOpen(true)}
              disabled={pending}
              className="h-8 w-8"
              title="Редактировать"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {isOwner && showDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={pending}
              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
              title="Удалить"
            >
              <Trash2 className="h-4 w-4" />
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
