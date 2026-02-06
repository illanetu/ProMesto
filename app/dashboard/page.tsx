import { Suspense } from "react"
import { getMyMestos } from "@/lib/mesto-queries"
import { MestoMyPlacesView } from "@/components/dashboard/MestoMyPlacesView"

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = params.q ?? ""
  const page = parseInt(params.page ?? "1", 10) || 1

  const { mestos, total, pageSize } = await getMyMestos({
    search: q || undefined,
    page,
  })

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
      <Suspense fallback={<div className="animate-pulse space-y-4" />}>
        <MestoMyPlacesView
          mestos={mestos}
          total={total}
          pageSize={pageSize}
          currentPage={page}
        />
      </Suspense>
    </div>
  )
}
