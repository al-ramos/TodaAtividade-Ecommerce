'use client'

import { useState } from 'react'
import { Tag, X, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/types'

export type AppliedCoupon = {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  discount: number // centavos
}

type Props = {
  orderTotal: number // centavos
  onApply: (coupon: AppliedCoupon | null) => void
}

export function CouponInput({ orderTotal, onApply }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState<AppliedCoupon | null>(null)

  async function handleApply() {
    const trimmed = code.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed, orderTotal }),
      })
      const data = await res.json()

      if (data.valid) {
        const coupon: AppliedCoupon = {
          id: data.coupon.id as string,
          code: data.coupon.code as string,
          type: data.coupon.type as 'percentage' | 'fixed',
          value: data.coupon.value as number,
          discount: data.discount as number,
        }
        setApplied(coupon)
        onApply(coupon)
        setCode('')
      } else {
        setError((data.error as string | undefined) ?? 'Cupom inválido')
      }
    } catch {
      setError('Erro ao validar cupom. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleRemove() {
    setApplied(null)
    onApply(null)
    setCode('')
    setError(null)
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm">
        <div className="flex items-center gap-2 text-green-700">
          <Tag className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{applied.code}</span>
          <span className="text-green-600">— {formatPrice(applied.discount)} de desconto</span>
        </div>
        <button
          onClick={handleRemove}
          className="ml-2 flex-shrink-0 text-green-600 hover:text-green-800 transition-colors"
          aria-label="Remover cupom"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            if (error) setError(null)
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleApply() }}
          placeholder="Código de cupom"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 text-sm font-medium text-gray-700 transition-colors"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Aplicar
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
