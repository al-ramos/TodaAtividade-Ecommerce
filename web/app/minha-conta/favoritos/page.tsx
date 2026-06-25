import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ArrowLeft } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { formatPrice, GRADE_LABELS, DISCIPLINE_LABELS, type Product } from '@/lib/types'
import FavoritoButton from '@/components/catalog/FavoritoButton'

export const metadata: Metadata = {
  title: 'Meus Favoritos',
  robots: { index: false, follow: false },
}

interface FavoriteRow {
  product_id: string
  products: Product
}

export default async function FavoritosPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login?callbackUrl=/minha-conta/favoritos')

  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select('product_id, products(*)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const favorites = (error ? [] : data) as FavoriteRow[]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/minha-conta/pedidos"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Favoritos</h1>
          <p className="text-sm text-gray-500">
            {favorites.length} {favorites.length === 1 ? 'atividade salva' : 'atividades salvas'}
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-24 text-center">
          <Heart className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-base font-medium text-gray-700">Você ainda não tem favoritos</p>
          <p className="mt-1 text-sm text-gray-400">
            Salve atividades para encontrá-las rapidamente quando quiser comprar.
          </p>
          <Link
            href="/atividades"
            className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Explorar o catálogo
          </Link>
        </div>
      ) : (
        /* Grid de favoritos */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {favorites.map(({ product_id, products: product }) => (
            <div
              key={product_id}
              className="group relative flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Thumbnail */}
              <Link href={`/atividades/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-gray-100">
                <Image
                  src={product.thumbnail_url}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              {/* Botão remover — canto superior direito */}
              <div className="absolute right-2 top-2">
                <FavoritoButton productId={product_id} initialIsFavorite={true} size="sm" />
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {GRADE_LABELS[product.grade_level]}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {DISCIPLINE_LABELS[product.discipline]}
                  </span>
                </div>

                <Link href={`/atividades/${product.slug}`}>
                  <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors leading-snug">
                    {product.title}
                  </h3>
                </Link>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                  <Link
                    href={`/atividades/${product.slug}`}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            </div>
         