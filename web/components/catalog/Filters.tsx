'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { GRADE_LABELS, DISCIPLINE_LABELS, type GradeLevel, type Discipline } from '@/lib/types'

export default function Filters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentGrade = searchParams.get('grade') as GradeLevel | null
  const currentDiscipline = searchParams.get('discipline') as Discipline | null
  const currentSearch = searchParams.get('search') ?? ''

  const updateFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/atividades?${params.toString()}`)
  }, [router, searchParams])

  const clearAll = () => router.push('/atividades')

  const hasFilters = currentGrade || currentDiscipline || currentSearch

  return (
    <div className="space-y-5">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar atividade..."
          defaultValue={currentSearch}
          onChange={(e) => {
            const val = e.target.value
            const timeout = setTimeout(() => updateFilter('search', val || null), 400)
            return () => clearTimeout(timeout)
          }}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm
            placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Série */}
      <div>
        <h3 className="mb-2.5 text-sm font-semibold text-gray-900">Série</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(GRADE_LABELS) as [GradeLevel, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => updateFilter('grade', currentGrade === key ? null : key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                currentGrade === key
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Disciplina */}
      <div>
        <h3 className="mb-2.5 text-sm font-semibold text-gray-900">Disciplina</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(DISCIPLINE_LABELS) as [Discipline, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => updateFilter('discipline', currentDiscipline === key ? null : key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                currentDiscipline === key
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Limpar filtros */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          <X className="h-4 w-4" /> Limpar filtros
        </button>
      )}
    </div>
  )
}
