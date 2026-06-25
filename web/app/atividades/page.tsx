import { Suspense } from 'react'
import { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase'
import ProductCard from '@/components/catalog/ProductCard'
import Filters from '@/components/catalog/Filters'
import type { Product, GradeLevel, Discipline } from '@/lib/types'
import { SlidersHorizontal } from 'lucide-react'

export const metadata: Metadata = { title: 'Catálogo de Atividades' }

interface PageProps {
  searchParams: { grade?: string; discipline?: string; search?: string }
}

async function getProducts(filters: PageProps['searchParams']): Promise<Product[]> {
  const supabase = createSupabaseServerClient()
  let query = supabase.from('products').select('*').eq('active', true)

  if (filters.grade)      query = query.eq('grade_level', filters.grade)
  if (filters.discipline) query = query.eq('discipline', filters.discipline)
  if (filters.search)     query = query.ilike('title', `%${filters.search}%`)

  const { data } = await query.order('created_at', { ascending: false })
  return (data as Product[]) ?? []
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const products = await getProducts(searchParams)
  const hasFilters = searchParams.grade || searchParams.discipline || searchParams.search

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catálogo de Atividades</h1>
        <p className="mt-1 text-sm text-gray-500">
          {products.length} {products.length === 1 ? 'atividade encontrada' : 'atividades encontradas'}
          {hasFilters && ' com os filtros aplicados'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar de filtros */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-900">Filtros</h2>
            </div>
            <Suspense fallback={null}>
              <Filters />
            </Suspense>
          </div>
        </aside>

        {/* Grid de produtos */}
        <div className="lg:col-span-3">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20">
              <p className="text-sm text-gray-500">Nenhuma atividade encontrada.</p>
              <a href="/atividades" className="mt-2 text-sm text-blue-600 hover:underline">Limpar filtros</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
