'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { XCircle, RotateCcw, QrCode, BookOpen } from 'lucide-react'
import Link from 'next/link'

// ─── Mensagens amigáveis para rejeição do Mercado Pago ────────────────────────
const REJECTION_MESSAGES: Record<string, string> = {
  cc_rejected_insufficient_amount: 'Saldo insuficiente no cartão.',
  cc_rejected_bad_filled_card_number: 'Número do cartão inválido.',
  cc_rejected_bad_filled_date: 'Data de validade incorreta.',
  cc_rejected_bad_filled_security_code: 'Código de segurança (CVV) inválido.',
  cc_rejected_blacklist: 'Cartão não autorizado.',
  cc_rejected_call_for_authorize: 'Entre em contato com seu banco para autorizar a compra.',
  cc_rejected_card_disabled: 'Cartão desativado. Entre em contato com seu banco.',
  cc_rejected_duplicated_payment: 'Pagamento duplicado detectado.',
  cc_rejected_high_risk: 'Pagamento recusado por segurança. Tente outro cartão.',
  cc_rejected_max_attempts: 'Limite de tentativas atingido. Aguarde e tente novamente.',
  cc_rejected_other_reason: 'Pagamento não autorizado. Tente outro cartão.',
}

function FalhaContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') ?? 'cc_rejected_other_reason'
  const orderId = searchParams.get('orderId')

  const message =
    REJECTION_MESSAGES[reason] ??
    'Pagamento não autorizado. Tente outro cartão ou use o Pix.'

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 text-center space-y-6">
      {/* Ícone */}
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
        <XCircle className="w-8 h-8 text-red-500" />
      </div>

      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pagamento recusado</h1>
        <p className="text-gray-500 mt-2 text-sm">{message}</p>
        {orderId && (
          <p className="text-xs text-gray-400 mt-2">
            Pedido:{' '}
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{orderId}</span>
          </p>
        )}
      </div>

      {/* Dica */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left">
        <p className="text-sm font-semibold text-amber-800 mb-1">O que você pode fazer:</p>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Verifique os dados do cartão e tente novamente</li>
          <li>• Use outro cartão de crédito</li>
          <li>• Pague via Pix — aprovação instantânea e sem taxas</li>
        </ul>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <Link
          href="/checkout/cartao"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Tentar com outro cartão
        </Link>
        <Link
          href="/checkout"
          className="w-full flex items-center justify-center gap-2 border-2 border-green-500 text-green-700 hover:bg-green-50 font-semibold py-3 rounded-lg transition-colors text-sm"
        >
          <QrCode className="w-4 h-4" />
          Pagar com Pix
        </Link>
        <Link
          href="/atividades"
          className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium py-2 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Continuar navegando
        </Link>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FalhaPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
      <div className="max-w-md w-full mx-auto px-4">
        <Suspense
          fallback={
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="animate-pulse space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto" />
                <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
              </div>
            </div>
          }
        >
          <FalhaContent />
        </Suspense>
      </div>
    </main>
  )
}
