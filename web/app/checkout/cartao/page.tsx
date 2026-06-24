'use client'

import Script from 'next/script'
import { useState, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/types'
import { ArrowLeft, CreditCard, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// ─── Tipos do SDK de browser do Mercado Pago ─────────────────────────────────
interface MercadoPagoInstance {
  createCardToken(data: {
    cardNumber: string
    cardholderName: string
    cardExpirationMonth: string
    cardExpirationYear: string
    securityCode: string
    identificationType?: string
    identificationNumber?: string
  }): Promise<{ id: string }>
}

declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: { locale?: string }) => MercadoPagoInstance
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
interface CardBrand {
  id: string
  label: string
  cvvLength: number
}

function detectBrand(num: string): CardBrand {
  const n = num.replace(/\D/g, '')
  if (/^4011|^4312|^4389|^4514|^4576|^5067|^509|^6504|^6505|^6516|^6550/.test(n))
    return { id: 'elo', label: 'Elo', cvvLength: 3 }
  if (/^6062|^637095|^637568|^637599|^637609|^637612/.test(n))
    return { id: 'hipercard', label: 'Hipercard', cvvLength: 3 }
  if (/^5[1-5]|^2[2-7]/.test(n))
    return { id: 'master', label: 'Mastercard', cvvLength: 3 }
  if (/^4/.test(n))
    return { id: 'visa', label: 'Visa', cvvLength: 3 }
  return { id: '', label: '', cvvLength: 3 }
}

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim()
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function formatCPF(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

const BRAND_COLORS: Record<string, string> = {
  visa: 'bg-blue-100 text-blue-700',
  master: 'bg-orange-100 text-orange-700',
  elo: 'bg-yellow-100 text-yellow-800',
  hipercard: 'bg-red-100 text-red-700',
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CartaoPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()

  const [mpLoaded, setMpLoaded] = useState(false)
  const mpRef = useRef<MercadoPagoInstance | null>(null)

  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cpf, setCpf] = useState('')

  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const brand = detectBrand(cardNumber)

  function handleMpLoad() {
    try {
      const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ?? ''
      if (!publicKey) {
        console.warn('[cartao] NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY não definida')
        return
      }
      mpRef.current = new window.MercadoPago(publicKey, { locale: 'pt-BR' })
      setMpLoaded(true)
    } catch (err) {
      console.error('[cartao] MP init error:', err)
      toast.error('Erro ao carregar gateway de pagamento. Recarregue a página.')
    }
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}

    if (cardNumber.replace(/\D/g, '').length < 13)
      errors.cardNumber = 'Número do cartão inválido'

    if (!cardName.trim())
      errors.cardName = 'Nome obrigatório'

    const expiryDigits = expiry.replace(/\D/g, '')
    if (expiryDigits.length !== 4) {
      errors.expiry = 'Data inválida — use MM/AA'
    } else {
      const month = parseInt(expiryDigits.slice(0, 2), 10)
      if (month < 1 || month > 12) errors.expiry = 'Mês inválido'
    }

    if (cvv.replace(/\D/g, '').length < 3)
      errors.cvv = 'CVV inválido'

    if (cpf.replace(/\D/g, '').length !== 11)
      errors.cpf = 'CPF inválido (apenas números)'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return
    if (!mpRef.current) {
      toast.error('Gateway de pagamento não carregado. Aguarde e tente novamente.')
      return
    }

    setLoading(true)
    const expiryDigits = expiry.replace(/\D/g, '')

    try {
      // 1. Tokenizar cartão no browser — dados nunca chegam ao nosso servidor
      const tokenResult = await mpRef.current.createCardToken({
        cardNumber: cardNumber.replace(/\D/g, ''),
        cardholderName: cardName.trim(),
        cardExpirationMonth: expiryDigits.slice(0, 2),
        cardExpirationYear: `20${expiryDigits.slice(2)}`,
        securityCode: cvv,
        identificationType: 'CPF',
        identificationNumber: cpf.replace(/\D/g, ''),
      })

      // 2. Enviar apenas o token (nunca dados brutos do cartão) ao servidor
      const res = await fetch('/api/checkout/cartao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardToken: tokenResult.id,
          paymentMethodId: brand.id || 'visa',
          items: items.map(({ product, quantity }) => ({
            product_id: product.id,
            title: product.title,
            price: product.price,
            quantity,
          })),
        }),
      })

      type CheckoutResponse = {
        order_id?: string
        payment_id?: number
        status?: string
        status_detail?: string
        error?: string
      }
      const data = (await res.json()) as CheckoutResponse

      if (res.ok && data.status === 'approved') {
        clearCart()
        router.push(`/pedido/sucesso?orderId=${data.order_id ?? ''}`)
      } else if (data.status === 'rejected') {
        router.push(
          `/pedido/falha?orderId=${data.order_id ?? ''}&reason=${encodeURIComponent(data.status_detail ?? 'rejected')}`,
        )
      } else {
        toast.error(data.error ?? 'Pagamento não aprovado. Verifique os dados e tente novamente.')
      }
    } catch (err) {
      console.error('[cartao] submit error:', err)
      toast.error('Erro de conexão. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Carrinho vazio.</p>
          <Link href="/atividades" className="text-blue-600 hover:underline text-sm">
            Ver atividades
          </Link>
        </div>
      </main>
    )
  }

  const isSubmitDisabled = loading || !mpLoaded

  return (
    <>
      <Script src="https://sdk.mercadopago.com/js/v2" onLoad={handleMpLoad} />

      <main className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-lg mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/checkout"
              className="inline-flex items-center gap-1 text-blue-600 text-sm hover:underline mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao checkout
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Pagar com cartão</h1>
          </div>

          <div className="space-y-4">
            {/* Resumo do valor */}
            <div className="bg-white rounded-xl shadow-sm px-5 py-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {items.length} {items.length === 1 ? 'item' : 'itens'}
              </span>
              <span className="text-xl font-bold text-blue-600">{formatPrice(total)}</span>
            </div>

            {/* Formulário */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Dados do cartão</h2>
                {brand.label && (
                  <span
                    className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                      BRAND_COLORS[brand.id] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {brand.label}
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Número do cartão */}
                <div>
                  <label
                    htmlFor="cardNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Número do cartão
                  </label>
                  <input
                    id="cardNumber"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.cardNumber ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.cardNumber && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.cardNumber}</p>
                  )}
                </div>

                {/* Nome no cartão */}
                <div>
                  <label
                    htmlFor="cardName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nome impresso no cartão
                  </label>
                  <input
                    id="cardName"
                    type="text"
                    autoComplete="cc-name"
                    placeholder="NOME SOBRENOME"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.cardName ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.cardName && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.cardName}</p>
                  )}
                </div>

                {/* Validade + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="expiry"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Validade
                    </label>
                    <input
                      id="expiry"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/AA"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        fieldErrors.expiry ? 'border-red-400 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.expiry && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.expiry}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="cvv"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      CVV
                    </label>
                    <input
                      id="cvv"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="000"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, '').slice(0, brand.cvvLength || 3))
                      }
                      className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        fieldErrors.cvv ? 'border-red-400 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.cvv && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.cvv}</p>
                    )}
                  </div>
                </div>

                {/* CPF do titular */}
                <div>
                  <label
                    htmlFor="cpf"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    CPF do titular
                  </label>
                  <input
                    id="cpf"
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.cpf ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.cpf && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.cpf}</p>
                  )}
                </div>

                {/* Botão de pagamento */}
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processando pagamento...
                    </>
                  ) : !mpLoaded ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Aguardando gateway...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Pagar {formatPrice(total)}
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1 mt-1">
                  <Lock className="w-3 h-3" />
                  Dados criptografados · nunca passam pelo nosso servidor
                </p>
              </form>
            </div>

            {/* Bandeiras */}
            <div className="bg-white rounded-xl shadow-sm px-5 py-4">
              <p className="text-xs text-gray-500 text-center">
                Aceitamos{' '}
                <strong>Visa</strong> · <strong>Mastercard</strong> ·{' '}
                <strong>Elo</strong> · <strong>Hipercard</strong>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
