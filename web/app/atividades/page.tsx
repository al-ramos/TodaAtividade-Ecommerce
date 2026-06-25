import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase'
import ProductCard from '@/components/catalog/ProductCard'
import FiltrosCatalogo from '@/components/catalog/FiltrosCatalogo'
import ResultadosBusca from '@/components/catalog/ResultadosBusca'
import type { Product } from '@/lib/types'

interface ReviewSummary {
  product_id: string
  average_rating: number
  review_count: number
}

async function getReviewSummaries(productIds: string[]): Promise<Map<string, ReviewSummary>> {
  if (productIds.length === 0) return new Map()

  const { data } = await supabaseAdmin
    .from('reviews')
    .select('product_id, rating')
    .in('product_id', productIds)

  const map = new Map<string, ReviewSummary>()
  if (!data) return map

  const grouped: Record<string, number[]> = {}
  data.forEach((r: { product_id: string; rating: number }) => {
    if (!grouped[r.product_id]) grouped[r.product_id] = []
    grouped[r.product_id].push(r.rating)
  })

  Object.entries(grouped).forEach(([pid, ratings]) => {
    const avg = ratings.reduce((s, v) => s + v, 0) / ratings.length
    map.set(pid, {
      product_id: pid,
      average_rating: Math.round(avg * 10) / 10,
      review_count: ratings.length,
    })
  })

  return map
}

export const metadata: Metadata = {
  title: 'Catálogo de Atividades',
  description:
    'Explore centenas de atividades pedagógicas em PDF para ensino fundamental. Filtre por série (1º ao 9º ano), disciplina e muito mais.',
  alternates: { canonical: 'https://www.todaatividade.com.br/atividades' },
  openGraph: {
    title: 'Catálogo de Atividades | TodaAtividade',
    description:
      'Explore centenas de atividades pedagógicas em PDF para ensino fundamental. Filtre por série (1º ao 9º ano), disciplina e muito mais.',
    url: 'https://www.todaatividade.com.br/atividades',
    type: 'website',
    siteName: 'TodaAtividade',
    locale: 'pt_BR',
  },
}

const PAGE_SIZE = 12

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface SearchParams {
  /** Busca por texto (título OU descrição) */
  q?: string
  /** Compatibilidade com param antigo */
  search?: string
  grade?: string
  discipline?: string
  /** Faixas: 'free' | '20' | '50' | '50plus' */
  preco?: string
  /** 'recente' (default) | 'menor_preco' | 'maior_preco' | 'az' */
  ordem?: string
  page?: string
}

// ─── Busca no Supabase ────────────────────────────────────────────────────────

async function getProducts(
  sp: SearchParams,
): Promise<{ products: Product[]; total: number }> {
  const supabase = createSupabaseServerClient()

  // texto: suporta ?q= (novo) e ?search= (compatibilidade)
  const q    = (sp.q || sp.search || '').trim()
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('active', true)

  // busca textual: título OR descrição
  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  }

  // filtros enum
  if (sp.grade)      query = query.eq('grade_level', sp.grade)
  if (sp.discipline) query = query.eq('discipline', sp.discipline)

  // filtro de preço (centavos)
  if (sp.preco) {
    switch (sp.preco) {
      case 'free':   query = query.eq('price', 0);          break
      case '20':     query = query.lte('price', 2000);      break
      case '50':     query = query.lte('price', 5000);      break
      case '50plus': query = query.gt('price', 5000);       break
    }
  }

  // ordenação
  switch (sp.ordem) {
    case 'menor_preco': query = query.order('price',      { ascending: true  }); break
    case 'maior_preco': query = query.order('price',      { ascending: false }); break
    case 'az':          query = query.order('title',      { ascending: true  }); break
    default:            query = query.order('created_at', { ascending: false })
  }

  // paginação
  query = query.range(from, to)

  const { data, count } = await query
  return { products: (data as Product[]) ?? [], total: count ?? 0 }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPageUrl(sp: SearchParams, targetPage: number): string {
  const params = new URLSearchParams()
  const q = sp.q || sp.search || ''
  if (q)             params.set('q',          q)
  if (sp.grade)      params.set('grade',      sp.grade)
  if (sp.discipline) params.set('discipline', sp.discipline)
  if (sp.preco)      params.set('preco',      sp.preco)
  if (sp.ordem)      params.set('ordem',      sp.ordem)
  if (targetPage > 1) params.set('page',      String(targetPage))
  const qs = params.toString()
  return `/atividades${qs ? `?${qs}` : ''}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: SearchParams
}

async function getFavoriteIds(userId: string): Promise<Set<string>> {
  const { data } = await supabaseAdmin
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId)
  return new Set((data ?? []).map((f: { product_id: string }) => f.product_id))
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const [{ products, total }, session] = await Promise.all([
    getProducts(searchParams),
    getServerSession(authOptions),
  ])

  const [favoriteIds, reviewSummaries] = await Promise.all([
    session?.user?.id ? getFavoriteIds(session.user.id) : Promise.resolve(new Set<string>()),
    getReviewSummaries(products.map((p) => p.id)),
  ])

  const q           = (searchParams.q || searchParams.search || '').trim()
  const hasFilters  = !!(q || searchParams.grade || searchParams.discipline || searchParams.preco)
  const currentPage = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const totalPages  = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catálogo de Atividades</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* ── Sidebar de filtros ── */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-5">
            <Suspense fallback={null}>
              <FiltrosCatalogo />
            </Suspense>
          </div>
        </aside>

        {/* ── Área principal ── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Resumo de resultados */}
          <ResultadosBusca total={total} q={q} hasFilters={hasFilters} />

          {products.length > 0 ? (
            <>
              {/* Grid de produtos */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={favoriteIds.has(product.id)}
                    averageRating={reviewSummaries.get(product.id)?.average_rating}
                    reviewCount={reviewSummaries.get(product.id)?.review_count}
                  />
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <nav
                  aria-label="Paginação do catálogo"
                  className="flex items-center justify-center gap-3 pt-4"
                >
                  {currentPage > 1 ? (
                    <Link
                      href={buildPageUrl(searchParams, currentPage - 1)}
                      className="flex items-center gap-1 rounded-lg border border-gray-300
                        px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" /> Anterior
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 rounded-lg border border-gray-200
                      px-3 py-2 text-sm text-gray-300 select-none">
                      <ChevronLeft className="h-4 w-4" /> Anterior
                    </span>
                  )}

                  <span className="text-sm text-gray-500">
                    Página <span className="font-semibold">{currentPage}</span> de{' '}
                    <span className="font-semibold">{totalPages}</span>
                  </span>

                  {currentPage < totalPages ? (
                    <Link
                      href={buildPageUrl(searchParams, currentPage + 1)}
                      className="flex items-center gap-1 rounded-lg border border-gray-300
                        px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Próxima <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 rounded-lg border border-gray-200
                      px-3 py-2 text-sm text-gray-300 select-none">
                      Próxima <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </nav>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl
              border border-dashed border-gray-300 py-20">
              <p className="text-sm text-gray-500">Nenhuma atividade encontrada.</p>
              <Link
                href="/atividades"
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Limpar filtros
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
