'use client'

import { useCart } from '@/lib/cart-context'
import type { Product } from '@/lib/types'
import { ShoppingCart } from 'lucide-react'

interface Props {
  products: Product[]
}

export default function AddBundleToCartButton({ products }: Props) {
  const { addItems } = useCart()

  function handleClick() {
    addItems(products.map(p => ({ product: p, quantity: 1 })))
  }

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow hover:bg-blue-700 active:scale-95 transition-all"
    >
      <ShoppingCart className="h-5 w-5" />
      Adicionar kit ao carrinho
    </button>
  )
}
