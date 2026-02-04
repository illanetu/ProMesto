"use client"

import { useEffect, useState, useCallback } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"

interface SearchInputProps {
  placeholder?: string
  debounceMs?: number
}

export function SearchInput({
  placeholder = "Поиск…",
  debounceMs = 300,
}: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get("q") ?? ""
  const [value, setValue] = useState(q)

  const updateUrl = useCallback(
    (search: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) params.set("q", search)
      else params.delete("q")
      params.set("page", "1")
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  useEffect(() => {
    setValue(q)
  }, [q])

  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrl(value)
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [value, debounceMs, updateUrl])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9"
      />
    </div>
  )
}
