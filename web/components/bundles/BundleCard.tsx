import Link from 'next/link'
import Image from 'next/image'
import type { Bundle } from '@/lib/types'

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

interface Props {
  bundle: Bundle
}

export default function BundleCard({ bundle }: Props) {
  const discount = Math.round((1 - bundle.price / bundle.original_price) * 100)

  return (
    <Link
      href={`/bundles/${bundle.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {bundle.thumbnail_url ? (
          <Image
            src={bundle.thumbnail_url}
            alt={bundle.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
          </div>
        )}
        {discount > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow">
            Economize {discount}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {bundle.title}
        </h3>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-bold text-blue-600">{formatBRL(bundle.price)}</span>
          <span className="text-xs text-gray-400 line-through">{formatBRL(bundle.original_price)}</span>
        </div>
      </div>
    </Link>
  )
}
