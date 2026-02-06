import { Suspense } from "react"
import { getFavoriteMestos } from "@/lib/mesto-queries"
import { MestoCard } from "@/components/dashboard/MestoCard"
import { MestoListHeader } from "@/components/dashboard/MestoListHeader"

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function FavoritesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = params.q ?? ""
  const page = parseInt(params.page ?? "1", 10) || 1

  const { mestos, total, pageSize } = await getFavoriteMestos({
    search: q || undefined,
    page,
  })
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden px-6 py-4 sm:p-6">
      <h1 className="text-2xl font-bold text-slate-900">Личный кабинет</h1>
      <h2 className="mt-2 text-lg font-medium text-slate-600">Избранное</h2>

      <Suspense fallback={<div className="mt-4 h-10" />}>
        <MestoListHeader
          showCreate={false}
          total={total}
          totalPages={totalPages}
          currentPage={page}
          basePath="/dashboard/favorites"
        />
      </Suspense>

      {mestos.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-slate-600">
            В избранном пока ничего нет — отмечайте звёздочкой в «Мои места»
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {mestos.map((m) => (
            <MestoCard key={m.id} mesto={m} isOwner showDelete />
          ))}
        </div>
      )}
    </div>
  )
}
