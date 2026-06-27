import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Eye, Star } from 'lucide-react'
import { type Product, formatPrice, GRADE_LABELS, DISCIPLINE_LABELS } from '@/lib/types'
import { cn } from '@/lib/utils'
import FavoritoButton from '@/components/catalog/FavoritoButton'

interface ProductCardProps {
  product: Product
  className?: string
  isFavorite?: boolean
  averageRating?: number
  reviewCount?: number
}

export default function ProductCard({
  product,
  className,
  isFavorite = false,
  averageRating,
  reviewCount,
}: ProductCardProps) {
  return (
    <div className={cn(
      'group relative flex flex-col rounded-2xl border border-rose-100 bg-white',
      'overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5',
      className
    )}>
      {/* Botão favorito — canto superior direito */}
      <div className="absolute right-2 top-2 z-10">
        <FavoritoButton productId={product.id} initialIsFavorite={isFavorite} size="sm" />
      </div>

      {/* Thumbnail */}
      <Link href={`/atividades/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-rose-50">
        <Image
          src={product.thumbnail_url}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Preview overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors duration-200">
          <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-900
            opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm">
            <Eye className="h-3.5 w-3.5" /> Ver prévia
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Badges */}
        <div className="mb-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600">
            {GRADE_LABELS[product.grade_level]}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {DISCIPLINE_LABELS[product.discipline]}
          </span>
        </div>

        {/* Título */}
        <Link href={`/atividades/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-rose-500 transition-colors leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Link de prévia */}
        {product.pdf_key && (
          <a
            href={`/api/preview/${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors"
          >
            <Eye className="h-3 w-3" />
            Ver prévia
          </a>
        )}

        {/* Descrição curta */}
        <p className="mt-1 line-clamp-2 text-xs text-gray-500 flex-1">
          {product.description}
        </p>

        {/* Rating */}
        {typeof averageRating === 'number' && reviewCount !== undefined && reviewCount > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-medium text-gray-700">{averageRating.toFixed(1)}</span>
            <span>({reviewCount})</span>
          </div>
        )}

        {/* Preço + CTA */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          <button className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-medium text-white
            hover:bg-rose-600 active:scale-95 transition-all duration-150">
            <ShoppingCart className="h-3.5 w-3.5" />
            Comprar
          </button>
        </div>
      </div>
    </div>
  )
}
