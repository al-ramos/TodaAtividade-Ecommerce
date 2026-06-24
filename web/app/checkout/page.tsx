'use client'

import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/types'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ShoppingBag, ArrowLeft, QrCode, CreditCard, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function CheckoutPage() {
  const { items, total, count, clearCart } = useCart()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/checkout')
    return null
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
          <h1 className="text-xl font-semibold text-gray-700">Nenhum item no carrinho</h1>
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

  async function handlePix() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout/criar-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ product, quantity }) => ({
            product_id: product.id,
            title: product.title,
            price: product.price,
            quantity,
          })),
        }),
      })
      const data = await res.json() as {
        qr_code?: string
        qr_code_base64?: string
        payment_id?: string | number
        order_id?: string
        total_cents?: number
        error?: string
      }
      if (!res.ok) {
        setError(data.error ?? 'Erro ao gerar Pix. Tente novamente.')
        return
      }
      // Persist Pix data in sessionStorage for the Pix page
      sessionStorage.setItem('pix_data', JSON.stringify({
        qr_code: data.qr_code,
        qr_code_base64: data.qr_code_base64,
        payment_id: data.payment_id,
        order_id: data.order_id,
        total_cents: data.total_cents,
        expires_at: Date.now() + 30 * 60 * 1000,
      }))
      clearCart()
      router.push(`/checkout/pix?paymentId=${data.payment_id}`)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleCard() {
    router.push('/checkout/cartao')
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/carrinho" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Finalizar compra</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: buyer data + payment method */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados do comprador */}
            {session?.user && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-3">Dados do comprador</h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="text-gray-400 mr-1">Nome:</span>
                    {session.user.name}
                  </p>
                  <p>
                    <span className="text-gray-400 mr-1">E-mail:</span>
                    {session.user.email}
                  </p>
                </div>
              </div>
            )}

            {/* Forma de pagamento */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Forma de pagamento</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'pix'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <QrCode
                    className={`w-6 h-6 ${
                      paymentMethod === 'pix' ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  />
                  <span
                    className={`font-medium text-sm ${
                      paymentMethod === 'pix' ? 'text-blue-700' : 'text-gray-600'
                    }`}
                  >
                    Pix
                  </span>
                  <span className="text-xs text-green-600 font-medium">Instantâneo</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard
                    className={`w-6 h-6 ${
                      paymentMethod === 'credit_card' ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  />
                  <span
                    className={`font-medium text-sm ${
                      paymentMethod === 'credit_card' ? 'text-blue-700' : 'text-gray-600'
                    }`}
                  >
                    Cartão de crédito
                  </span>
                  <span className="text-xs text-gray-400">Até 12x</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Right column: order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-4">
              <h2 className="font-semibold text-gray-900 mb-4">
                Resumo ({count} {count === 1 ? 'item' : 'itens'})
              </h2>

              <div className="space-y-3 mb-4">
                {items.map(({ product }) => (
                  <div key={product.id} className="flex gap-3">
                    {product.thumbnail_url && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={product.thumbnail_url}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {product.title}
                      </p>
                      <p className="text-sm text-blue-600 font-bold mt-0.5">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-700">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-blue-600">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={paymentMethod === 'pix' ? handlePix : handleCard}
                disabled={loading}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading
                  ? 'Gerando pagamento...'
                  : paymentMethod === 'pix'
                  ? 'Gerar QR Code Pix'
                  : 'Continuar para cartão'}
              </button>

              {paymentMethod === 'pix' && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  ✓ Pagamento instantâneo e sem taxas extras
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
