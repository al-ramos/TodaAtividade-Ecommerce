'use client'

import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/types'
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function CarrinhoPage() {
  const { items, count, total, removeItem, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto" />
          <h1 className="text-xl font-semibold text-gray-700">Seu carrinho está vazio</h1>
          <p className="text-gray-500 text-sm">Explore nossas atividades e adicione ao carrinho</p>
          <Link
            href="/atividades"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ver atividades
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Carrinho <span className="text-gray-400 font-normal text-lg">({count} {count === 1 ? 'item' : 'itens'})</span>
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700 hover:underline transition-colors"
          >
            Limpar carrinho
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de itens */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product }) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
                {product.thumbnail_url && (
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={product.thumbnail_url}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">{product.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {product.grade_level && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {product.grade_level}
                      </span>
                    )}
                    {product.discipline && (
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        {product.discipline}
                      </span>
                    )}
                  </div>
                  <p className="text-blue-600 font-bold mt-2">{formatPrice(product.price)}</p>
                </div>
                <button
                  onClick={() => removeItem(product.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  aria-label="Remover item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            <Link
              href="/atividades"
              className="inline-flex items-center gap-1 text-blue-600 text-sm hover:underline mt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Continuar comprando
            </Link>
          </div>

          {/* Resumo */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-4">
              <h2 className="font-semibold text-gray-900 mb-4">Resumo do pedido</h2>
              <div className="space-y-2 text-sm text-gray-600">
                {items.map(({ product }) => (
                  <div key={product.id} className="flex justify-between">
                    <span className="line-clamp-1 flex-1 pr-2">{product.title}</span>
                    <span className="font-medium text-gray-900 flex-shrink-0">{formatPrice(product.price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-blue-600">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ✓ Acesso imediato após pagamento via Pix
              </p>
              <Link
                href="/checkout"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-3 rounded-lg mt-4 transition-colors"
              >
                Finalizar compra
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
