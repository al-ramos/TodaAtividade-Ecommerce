'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import type { CartItem, Product } from './types'

interface CartContextType {
  items: CartItem[]
  count: number
  total: number
  addItem: (product: Product) => void
  addItems: (items: CartItem[]) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

const CART_KEY = 'todaatividade_cart'
const SAVE_DEBOUNCE_MS = 2000

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  const scheduleSave = useCallback((nextItems: CartItem[]) => {
    if (!session?.user) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      fetch('/api/cart/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: nextItems }),
      }).catch(console.error)
    }, SAVE_DEBOUNCE_MS)
  }, [session])

  const persist = useCallback((next: CartItem[]) => {
    setItems(next)
    localStorage.setItem(CART_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event('cart-updated'))
    scheduleSave(next)
  }, [scheduleSave])

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      const exists = prev.find(i => i.product.id === product.id)
      const next = exists ? prev : [...prev, { product, quantity: 1 }]
      localStorage.setItem(CART_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event('cart-updated'))
      scheduleSave(next)
      return next
    })
    setIsOpen(true)
  }, [scheduleSave])

  const addItems = useCallback((newItems: CartItem[]) => {
    setItems(prev => {
      const existingIds = new Set(prev.map(i => i.product.id))
      const toAdd = newItems.filter(i => !existingIds.has(i.product.id))
      const next = toAdd.length > 0 ? [...prev, ...toAdd] : prev
      localStorage.setItem(CART_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event('cart-updated'))
      scheduleSave(next)
      return next
    })
    setIsOpen(true)
  }, [scheduleSave])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.product.id !== productId)
      persist(next)
      return next
    })
  }, [persist])

  const clearCart = useCallback(() => {
    persist([])
  }, [persist])

  const count = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, count, total,
      addItem, addItems, removeItem, clearCart,
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
