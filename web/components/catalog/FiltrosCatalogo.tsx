'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { GRADE_LABELS, DISCIPLINE_LABELS, type GradeLevel, type Discipline } from '@/lib/types'

const PRICE_FAIXAS = [
  { label: 'Grátis',        value: 'free'   },
  { label: 'Até R$20',      value: '20'     },
  { label: 'Até R$50',      value: '50'     },
  { label: 'Acima de R$50', value: '50plus' },
] as const

const ORDEM_OPTIONS = [
  { label: 'Mais recentes', value: 'recente'     },
  { label: 'Menor preço',   value: 'menor_preco' },
  { label: 'Maior preço',   value: 'maior_preco' },
  { label: 'A–Z',           value: 'az'          },
] as const

interface Props {
  /** Categorias dinâmicas opcionais — não usadas nesta versão (enum estático) */
  categorias?: string[]
}

export default function FiltrosCatalogo({ categorias: _categorias }: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const debounceRef  = useRef<ReturnType<typeof setTimeout>>()

  const q          = searchParams.get('q') ?? ''
  const grade      = searchParams.get('grade') as GradeLevel | null
  const discipline = searchParams.get('discipline') as Discipline | null
  const preco      = searchParams.get('preco') ?? ''
  const ordem      = searchParams.get('ordem') ?? 'recente'

  const hasFilters = !!(q || grade || discipline || preco)

  /** Atualiza um ou mais params e reseta a paginação */
  const update = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('page')
      for (const [key, value] of Object.entries(updates)) {
        value ? params.set(key, value) : params.delete(key)
      }
      router.push(`/atividades?${params.toString()}`)
    },
    [router, searchParams],
  )

  const clearAll = () => router.push('/atividades')

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-900">Filtros</h2>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
          >
            <X className="h-3 w-3" /> Limpar
          </button>
        )}
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          key={q} // remonta quando filtros são limpos externamente
          type="text"
          placeholder="Buscar atividade..."
          defaultValue={q}
          onChange={(e) => {
            const val = e.target.value
            clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(
              () => update({ q: val || null }),
              400,
            )
          }}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm
            placeholder:text-gray-400 focus:border-blue-500 focus:outline-none
            focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Ordenação */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Ordenar por</h3>
        <select
          value={ordem}
          onChange={(e) =>
            update({ ordem: e.target.value === 'recente' ? null : e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm
            text-gray-700 focus:border-blue-500 focus:outline-none
            focus:ring-2 focus:ring-blue-500/20"
        >
          {ORDEM_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Série */}
      <div>
        <h3 className="mb-2.5 text-sm font-semibold text-gray-900">Série</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(GRADE_LABELS) as [GradeLevel, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => update({ grade: grade === key ? null : key })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                grade === key
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
              onClick={() => update({ discipline: discipline === key ? null : key })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                discipline === key
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Preço */}
      <div>
        <h3 className="mb-2.5 text-sm font-semibold text-gray-900">Preço</h3>
        <div className="flex flex-wrap gap-2">
          {PRICE_FAIXAS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => update({ preco: preco === value ? null : value })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                preco === value
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
