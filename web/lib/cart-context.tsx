'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import type { CartItem, Product } from './types'

interface CartContextType {
  items: CartItem[]
  count: number
  total: number
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

const CART_KEY = 'todaatividade_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  const persist = (next: CartItem[]) => {
    setItems(next)
    localStorage.setItem(CART_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      const exists = prev.find(i => i.product.id === product.id)
      const next = exists ? prev : [...prev, { product, quantity: 1 }]
      localStorage.setItem(CART_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event('cart-updated'))
      return next
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.product.id !== productId)
      persist(next)
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    persist([])
  }, [])

  const count = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, count, total,
      addItem, removeItem, clearCart,
      isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
