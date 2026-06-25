import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import AddBundleToCartButton from '@/components/bundles/AddBundleToCartButton'
import type { BundleWithProducts } from '@/lib/types'
import { Tag } from 'lucide-react'

interface Props {
  params: { slug: string }
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

async function getBundle(slug: string): Promise<BundleWithProducts | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: bundle, error } = await supabase
    .from('bundles')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error || !bundle) return null

  const { data: items } = await supabase
    .from('bundle_items')
    .select('product_id')
    .eq('bundle_id', bundle.id)

  if (!items || items.length === 0) return { ...bundle, products: [] }

  const productIds = items.map((i: { product_id: string }) => i.product_id)

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)
    .eq('active', true)

  return { ...bundle, products: products ?? [] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bundle = await getBundle(params.slug)
  if (!bundle) return {}
  return {
    title: `${bundle.title} | TodaAtividade`,
    description: bundle.description ?? `Kit de atividades pedagógicas por ${formatBRL(bundle.price)}`,
    openGraph: bundle.thumbnail_url ? { images: [bundle.thumbnail_url] } : undefined,
  }
}

export const revalidate = 60

export default async function BundlePage({ params }: Props) {
  const bundle = await getBundle(params.slug)
  if (!bundle) notFound()

  const discount = Math.round((1 - bundle.price / bundle.original_price) * 100)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">

        {/* Thumbnail */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100">
          {bundle.thumbnail_url ? (
            <Image
              src={bundle.thumbnail_url}
              alt={bundle.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            </div>
          )}
          {discount > 0 && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
              <Tag className="h-3.5 w-3.5" />
              Economize {discount}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">{bundle.title}</h1>
            {bundle.description && (
              <p className="mt-3 text-gray-600 leading-relaxed">{bundle.description}</p>
            )}
          </div>

          {/* Preço */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-blue-600">{formatBRL(bundle.price)}</span>
              <span className="text-base text-gray-400 line-through">{formatBRL(bundle.original_price)}</span>
            </div>
            {discount > 0 && (
              <p className="mt-1 text-sm font-medium text-green-600">
                Você economiza {formatBRL(bundle.original_price - bundle.price)} comprando o kit
              </p>
            )}
          </div>

          {/* CTA */}
          <AddBundleToCartButton products={bundle.products} />

          {/* Produtos incluídos */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              O kit inclui {bundle.products.length} atividade{bundle.products.length !== 1 ? 's' : ''}
            </h2>
            <ul className="space-y-2">
              {bundle.products.map(product => (
                <li key={product.id} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3">
                  {product.thumbnail_url && (
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <Image
                        src={product.thumbnail_url}
                        alt={product.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-800">{product.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
