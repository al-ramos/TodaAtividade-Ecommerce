'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginacaoProps {
  page: number
  totalPages: number
}

export function Paginacao({ page, totalPages }: PaginacaoProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`?${params.toString()}`)
  }

  return (
    <nav
      aria-label="Paginação de pedidos"
      className="flex items-center justify-between pt-2"
    >
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </button>

      <span className="text-sm text-gray-500">
        Página {page} de {totalPages}
      </span>

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Próxima página"
      >
        Próxima
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
