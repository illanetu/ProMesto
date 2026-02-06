import { Suspense } from "react"
import { getPublicMestos } from "@/lib/mesto-queries"
import { MestoPublicPlacesView } from "@/components/dashboard/MestoPublicPlacesView"

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>
}

export default async function PublicMestosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = params.q ?? ""
  const page = parseInt(params.page ?? "1", 10) || 1
  const sort = params.sort === "popular" ? "popular" : "recent"

  const { mestos, total, pageSize, userId } = await getPublicMestos({
    search: q || undefined,
    page,
    sort,
  })

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
      <Suspense fallback={<div className="animate-pulse space-y-4" />}>
        <MestoPublicPlacesView
          mestos={mestos}
          total={total}
          pageSize={pageSize}
          currentPage={page}
          userId={userId}
          sort={sort}
        />
      </Suspense>
    </div>
  )
}
