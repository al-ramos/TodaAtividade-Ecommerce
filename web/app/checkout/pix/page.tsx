'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Clock, Copy, Check, Loader2, XCircle } from 'lucide-react'
import Image from 'next/image'
import { formatPrice } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────
interface PixData {
  qr_code: string
  qr_code_base64: string
  payment_id: string | number
  order_id: string
  total_cents: number
  expires_at: number
}

type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'expired'

// ─── Inner component (needs useSearchParams) ──────────────────────────────────
function PixPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('paymentId')

  const [pixData, setPixData] = useState<PixData | null>(null)
  const [copied, setCopied] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [status, setStatus] = useState<PaymentStatus>('pending')

  // ── Load Pix data from sessionStorage ──────────────────────────────────────
  useEffect(() => {
    if (!paymentId) {
      router.push('/checkout')
      return
    }
    const stored = sessionStorage.getItem('pix_data')
    if (!stored) {
      router.push('/checkout')
      return
    }
    try {
      const data = JSON.parse(stored) as PixData
      if (!data.qr_code || !data.qr_code_base64) {
        router.push('/checkout')
        return
      }
      setPixData(data)
      const remaining = Math.max(0, Math.floor((data.expires_at - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining === 0) setStatus('expired')
    } catch {
      router.push('/checkout')
    }
  }, [router, paymentId])

  // ── Countdown timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (secondsLeft <= 0 || status !== 'pending') return
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id)
          setStatus('expired')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [secondsLeft, status])

  // ── Poll payment status every 5 s ──────────────────────────────────────────
  const pollStatus = useCallback(async () => {
    if (!paymentId || status !== 'pending') return
    try {
      const res = await fetch(`/api/checkout/status/${paymentId}`)
      if (!res.ok) return
      const data = await res.json() as { status: string; external_reference?: string }
      if (data.status === 'approved') {
        setStatus('approved')
        sessionStorage.removeItem('pix_data')
        const orderId = pixData?.order_id ?? data.external_reference
        setTimeout(() => {
          router.push(`/pedido/sucesso${orderId ? `?orderId=${orderId}` : ''}`)
        }, 2000)
      } else if (data.status === 'rejected' || data.status === 'cancelled') {
        setStatus('rejected')
      }
    } catch {
      // silent — keep polling
    }
  }, [paymentId, status, pixData, router])

  useEffect(() => {
    if (status !== 'pending' || !paymentId) return
    const id = setInterval(pollStatus, 5000)
    return () => clearInterval(id)
  }, [pollStatus, status, paymentId])

  // ── Copy Pix code ───────────────────────────────────────────────────────────
  async function handleCopy() {
    if (!pixData?.qr_code) return
    await navigator.clipboard.writeText(pixData.qr_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (!pixData) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </main>
    )
  }

  // ── Approved ────────────────────────────────────────────────────────────────
  if (status === 'approved') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Pagamento aprovado!</h1>
          <p className="text-gray-500">Redirecionando para seus pedidos...</p>
          <Loader2 className="w-5 h-5 animate-spin text-green-500 mx-auto" />
        </div>
      </main>
    )
  }

  // ── Rejected / Expired ──────────────────────────────────────────────────────
  if (status === 'rejected' || status === 'expired') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-5 max-w-sm mx-auto px-4">
          <XCircle className="w-20 h-20 text-red-400 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">
            {status === 'expired' ? 'Pix expirado' : 'Pagamento não aprovado'}
          </h1>
          <p className="text-gray-500 text-sm">
            {status === 'expired'
              ? 'O QR Code expirou. Gere um novo pagamento para continuar.'
              : 'O pagamento foi recusado. Tente novamente.'}
          </p>
          <button
            onClick={() => router.push('/checkout')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    )
  }

  // ── Active Pix QR Code ──────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6 text-center">
          {/* Título */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pagar com Pix</h1>
            <p className="text-gray-500 text-sm mt-1">
              Escaneie o QR Code ou copie o código abaixo
            </p>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2">
            <Clock
              className={`w-4 h-4 ${secondsLeft < 300 ? 'text-red-500' : 'text-gray-400'}`}
            />
            <span
              className={`font-mono text-lg font-semibold tabular-nums ${
                secondsLeft < 300 ? 'text-red-500' : 'text-gray-700'
              }`}
            >
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs text-gray-400">para expirar</span>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-2 rounded-xl border-2 border-gray-100 inline-block">
              <Image
                src={`data:image/png;base64,${pixData.qr_code_base64}`}
                alt="QR Code Pix"
                width={220}
                height={220}
                className="rounded-lg"
                unoptimized
              />
            </div>
          </div>

          {/* Valor */}
          <div className="bg-blue-50 rounded-xl py-3 px-4">
            <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-0.5">
              Valor a pagar
            </p>
            <p className="text-2xl font-bold text-blue-700">
              {formatPrice(pixData.total_cents)}
            </p>
          </div>

          {/* Copia e cola */}
          <div className="space-y-2 text-left">
            <p className="text-sm text-gray-500 font-medium">Código copia e cola:</p>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 font-mono break-all border border-gray-200 max-h-[5rem] overflow-y-auto">
              {pixData.qr_code}
            </div>
            <button
              onClick={handleCopy}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all border ${
                copied
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
              }`}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? 'Código copiado!' : 'Copiar código Pix'}
            </button>
          </div>

          {/* Aguardando confirmação */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2 border-t">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Aguardando confirmação do pagamento...</span>
          </div>

          <p className="text-xs text-gray-400">
            Após o pagamento, você terá acesso imediato às atividades.
          </p>
        </div>
      </div>
    </main>
  )
}

// ─── Default export (wrapped in Suspense for useSearchParams) ────────────────
export default function PixPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
      }
    >
      <PixPageContent />
    </Suspense>
  )
}
