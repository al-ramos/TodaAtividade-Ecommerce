import { Suspense } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase'
import ProductCard from '@/components/catalog/ProductCard'
import { SearchInput } from '@/components/search/SearchInput'

interface Props {
  searchParams: { q?: string; page?: string }
}

async function SearchResults({ q, page }: { q: string; page: number }) {
  if (!q || q.length < 2) {
    return (
      <p className="text-gray-500 text-center py-12">
        Digite ao menos 2 caracteres para buscar.
      </p>
    )
  }

  const perPage = 12
  const offset = (page - 1) * perPage
  const supabase = createSupabaseServerClient()

  const { data: ftsData, count: ftsCount, error: ftsError } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('active', true)
    .textSearch('search_vector', q, { type: 'websearch', config: 'portuguese' })
    .range(offset, offset + perPage - 1)

  // Fallback to ilike if FTS fails or returns nothing
  if (ftsError || (ftsData && ftsData.length === 0)) {
    const { data: ilikeData } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('active', true)
      .ilike('title', `%${q}%`)
      .range(offset, offset + perPage - 1)

    if (!ilikeData || ilikeData.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            Nenhum resultado para &ldquo;<strong>{q}</strong>&rdquo;
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Tente palavras diferentes ou navegue pelo{' '}
            <a href="/atividades" className="text-blue-600 hover:underline">catálogo</a>.
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {ilikeData.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    )
  }

  const products = ftsData || []
  const total = ftsCount || 0
  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        {total} resultado{total !== 1 ? 's' : ''} para &ldquo;<strong>{q}</strong>&rdquo;
      </p>
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <a
                  key={i}
                  href={`/busca?q=${encodeURIComponent(q)}&page=${i + 1}`}
                  className={`px-3 py-1 rounded border text-sm ${
                    page === i + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            Nenhum resultado para &ldquo;<strong>{q}</strong>&rdquo;
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Tente palavras diferentes ou navegue pelo{' '}
            <a href="/atividades" className="text-blue-600 hover:underline">catálogo</a>.
          </p>
        </div>
      )}
    </div>
  )
}

export default function BuscaPage({ searchParams }: Props) {
  const q = searchParams.q || ''
  const page = parseInt(searchParams.page || '1')

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {q ? `Busca: "${q}"` : 'Buscar Atividades'}
      </h1>
      <div className="mb-8 max-w-lg">
        <SearchInput />
      </div>
      <Suspense fallback={<div className="text-center py-12 text-gray-400">Buscando...</div>}>
        <SearchResults q={q} page={page} />
      </Suspense>
    </main>
  )
}

export function generateMetadata({ searchParams }: Props) {
  const q = searchParams.q
  return {
    title: q ? `Busca: ${q} — TodaAtividade` : 'Buscar Atividades — TodaAtividade',
    robots: { index: false },
  }
}
