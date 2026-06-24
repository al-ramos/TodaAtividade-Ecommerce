'use client'

import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'
import { useCart } from '@/lib/cart-context'

interface Props { product: Product }

export default function AddToCartButton({ product }: Props) {
  const { addItem, items } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const inCart = items.some(i => i.product.id === product.id)

  function handleAddToCart() {
    if (inCart) {
      toast.info('Esta atividade ja esta no seu carrinho.')
      return
    }

    addItem(product)
    setJustAdded(true)
    toast.success('Atividade adicionada ao carrinho!')
    setTimeout(() => setJustAdded(false), 2500)
  }

  const active = inCart || justAdded

  return (
    <button
      onClick={handleAddToCart}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-green-600 text-white cursor-default'
          : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
      }`}
    >
      {active ? (
        <><Check className="h-4 w-4" /> {inCart && !justAdded ? 'No carrinho' : 'Adicionado!'}</>
      ) : (
        <><ShoppingCart className="h-4 w-4" /> Adicionar ao carrinho</>
      )}
    </button>
  )
}
