import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, ChevronRight, FileText, GraduationCap, BookOpen, Share2 } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase'
import { formatPrice, GRADE_LABELS, DISCIPLINE_LABELS, type Product } from '@/lib/types'
import AddToCartButton from '@/components/catalog/AddToCartButton'

interface Props { params: { slug: string } }

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()
  return data as Product | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Atividade não encontrada' }
  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: product.thumbnail_url, width: 800, height: 1100 }],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">Início</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/atividades" className="hover:text-blue-600">Catálogo</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Prévia do PDF */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 aspect-[3/4]">
            <Image
              src={product.preview_url}
              alt={`Prévia: ${product.title}`}
              fill
              className="object-contain"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent py-4">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800">
                📄 Prévia da 1ª página
              </span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400">
            Prévia ilustrativa · O PDF completo contém {product.page_count ?? '—'} páginas
          </p>
        </div>

        {/* Info do produto */}
        <div className="flex flex-col">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {GRADE_LABELS[product.grade_level]}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {DISCIPLINE_LABELS[product.discipline]}
            </span>
          </div>

          {/* Título */}
          <h1 className="mt-3 text-2xl font-bold leading-snug text-gray-900 sm:text-3xl">
            {product.title}
          </h1>

          {/* Preço */}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            <span className="text-sm text-gray-500">no Pix ou cartão</span>
          </div>

          {/* CTA */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton product={product} />
            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 rounded-xl border border-blue-600 px-5 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Comprar agora
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-5 flex flex-wrap gap-3">
            {['🔒 Pagamento seguro', '📥 Download imediato', '✅ PDF completo'].map(t => (
              <span key={t} className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1">{t}</span>
            ))}
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Descrição */}
          <div className="space-y-4">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <BookOpen className="h-4 w-4 text-blue-600" /> Descrição
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{product.description}</p>
            </div>
            {product.pedagogical_objectives && (
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <GraduationCap className="h-4 w-4 text-blue-600" /> Objetivos pedagógicos
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{product.pedagogical_objectives}</p>
              </div>
            )}
            {product.page_count && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                <span>{product.page_count} páginas · Formato PDF · Pronto para imprimir</span>
              </div>
            )}
          </div>

          {/* Compartilhar */}
          <div className="mt-6">
            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition-colors">
              <Share2 className="h-4 w-4" /> Compartilhar esta atividade
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
