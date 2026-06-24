'use client'

import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'

interface Props { product: Product }

export default function AddToCartButton({ product }: Props) {
  const [added, setAdded] = useState(false)

  function handleAddToCart() {
    // Lê o carrinho atual do localStorage
    const cart = JSON.parse(localStorage.getItem('cart') ?? '[]') as Array<{ product: Product; addedAt: string }>
    const exists = cart.some(item => item.product.id === product.id)

    if (exists) {
      toast.info('Esta atividade já está no seu carrinho.')
      return
    }

    cart.push({ product, addedAt: new Date().toISOString() })
    localStorage.setItem('cart', JSON.stringify(cart))

    // Dispara evento para o header atualizar o contador
    window.dispatchEvent(new Event('cart-updated'))

    setAdded(true)
    toast.success('Atividade adicionada ao carrinho!')
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <button
      onClick={handleAddToCart}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
        added
          ? 'bg-green-600 text-white'
          : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
      }`}
    >
      {added ? (
        <><Check className="h-4 w-4" /> Adicionado!</>
      ) : (
        <><ShoppingCart className="h-4 w-4" /> Adicionar ao carrinho</>
      )}
    </button>
  )
}
