import Link from 'next/link'
import { X } from 'lucide-react'

interface Props {
  total: number
  q?: string
  hasFilters: boolean
}

/**
 * Exibe "X resultados para 'q'" ou "Nenhum resultado encontrado" com link
 * para limpar filtros. Retorna null quando não há filtros ativos.
 */
export default function ResultadosBusca({ total, q, hasFilters }: Props) {
  if (!hasFilters) return null

  return (
    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2.5 text-sm">
      <span className="text-gray-700">
        {total === 0 ? (
          'Nenhum resultado encontrado'
        ) : (
          <>
            <span className="font-semibold">{total}</span>{' '}
            {total === 1 ? 'resultado' : 'resultados'}
            {q && (
              <>
                {' '}para{' '}
                <span className="font-semibold">&ldquo;{q}&rdquo;</span>
              </>
            )}
          </>
        )}
      </span>

      {total === 0 && (
        <Link
          href="/atividades"
          className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <X className="h-3.5 w-3.5" /> Limpar filtros
        </Link>
      )}
    </div>
  )
}
