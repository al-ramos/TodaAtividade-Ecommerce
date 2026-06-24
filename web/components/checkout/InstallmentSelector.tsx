'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Installment {
  installments: number
  installment_amount: number  // centavos
  total_amount: number        // centavos
  recommended_message: string
  has_interest: boolean
  labels: string[]
}

export interface InstallmentSelectorProps {
  /** Valor total do pedido em centavos */
  amountCents: number
  /** Número de parcelas atualmente selecionado */
  value: number
  /** Callback chamado ao selecionar uma opção */
  onChange: (installments: number, installmentAmount: number, totalAmount: number) => void
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────
export function InstallmentSelector({
  amountCents,
  value,
  onChange,
  className = '',
}: InstallmentSelectorProps) {
  const [options, setOptions] = useState<Installment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!amountCents || amountCents < 100) return

    setLoading(true)
    setError(null)

    fetch(`/api/checkout/parcelas?amount=${amountCents}`)
      .then((r) => r.json())
      .then((data: { installments?: Installment[] }) => {
        if (data.installments && data.installments.length > 0) {
          setOptions(data.installments)
          // Inicializa com 1x se ainda não há seleção
          if (value === 0) {
            const first = data.installments[0]
            onChange(first.installments, first.installment_amount, first.total_amount)
          }
        }
      })
      .catch(() => setError('Não foi possível carregar as opções de parcelamento.'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountCents])

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 py-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando opções de parcelamento...
      </div>
    )
  }

  if (error) {
    return <p className={`text-sm text-red-500 ${className}`}>{error}</p>
  }

  if (options.length === 0) return null

  const selectedOption = options.find((o) => o.installments === value)

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Parcelas</label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value)
            const opt = options.find((o) => o.installments === n)
            if (opt) onChange(opt.installments, opt.installment_amount, opt.total_amount)
          }}
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {options.map((opt) => (
            <option key={opt.installments} value={opt.installments}>
              {opt.recommended_message}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {selectedOption && value > 1 && (
        <p
          className={`text-xs mt-1.5 ${
            selectedOption.has_interest ? 'text-amber-600' : 'text-green-600'
          }`}
        >
          {selectedOption.has_interest ? (
            <>⚠ Total com juros: {formatPrice(selectedOption.total_amount)}</>
          ) : (
            <>✓ Sem juros — Total: {formatPrice(selectedOption.total_amount)}</>
          )}
        </p>
      )}
    </div>
  )
}
