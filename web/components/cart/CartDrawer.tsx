'use client'

import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/types'
import { X, ShoppingCart, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

export function CartDrawer() {
  const { items, count, total, removeItem, closeCart, isOpen } = useCart()

  // Fechar com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeCart])

  // Travar scroll do body quando aberto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">
              Meu carrinho {count > 0 && <span className="text-blue-600">({count})</span>}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fechar carrinho"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-gray-400">
              <ShoppingCart className="w-12 h-12" />
              <p className="text-sm">Seu carrinho está vazio</p>
              <button
                onClick={closeCart}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            items.map(({ product }) => (
              <div key={product.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                {product.thumbnail_url && (
                  <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                    <Image
                      src={product.thumbnail_url}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.title}</p>
                  <p className="text-blue-600 font-bold text-sm mt-1">{formatPrice(product.price)}</p>
                </div>
                <button
                  onClick={() => removeItem(product.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  aria-label="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t space-y-3 bg-white">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{count} {count === 1 ? 'item' : 'itens'}</span>
              <span className="font-bold text-gray-900 text-base">{formatPrice(total)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-3 rounded-lg transition-colors"
            >
              Finalizar compra
            </Link>
            <Link
              href="/carrinho"
              onClick={closeCart}
              className="block w-full text-center text-blue-600 text-sm font-medium hover:underline"
            >
              Ver carrinho completo
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
