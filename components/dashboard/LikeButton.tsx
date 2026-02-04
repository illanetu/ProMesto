"use client"

import { useState } from "react"
import { ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface LikeButtonProps {
  mestoId: string
  initialLiked: boolean
  initialCount: number
}

export function LikeButton({
  mestoId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    setError(null)
    const prevLiked = liked
    const prevCount = count
    setLiked(!liked)
    setCount(liked ? count - 1 : count + 1)

    try {
      const res = await fetch(`/api/mestos/${mestoId}/like`, { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setLiked(prevLiked)
        setCount(prevCount)
        if (res.status === 401) {
          setError("Войдите, чтобы поставить лайк")
          router.push("/login")
          return
        }
        setError(data.error ?? "Попробуйте позже")
        return
      }
      setLiked(data.liked)
      setCount(data.likesCount)
      router.refresh()
    } catch {
      setLiked(prevLiked)
      setCount(prevCount)
      setError("Попробуйте позже")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={loading}
        className={cn(
          "h-8 gap-1 px-2",
          liked && "text-emerald-600 hover:text-emerald-700"
        )}
        title={liked ? "Убрать лайк" : "Нравится"}
      >
        <ThumbsUp
          className={cn("h-4 w-4", liked && "fill-current")}
        />
        <span className="text-sm">{count}</span>
      </Button>
      {error && (
        <span className="text-xs text-red-600" title={error}>
          !
        </span>
      )}
    </div>
  )
}
