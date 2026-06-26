'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, CheckCircle, XCircle, CreditCard, Calendar, Loader2, ArrowRight } from 'lucide-react'

type SubStatus = {
  isActive: boolean
  status: string | null
  currentPeriodEnd: string | null
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativa',
  trialing: 'Em teste',
  past_due: 'Pagamento atrasado',
  canceled: 'Cancelada',
  unpaid: 'Não paga',
  incomplete: 'Incompleta',
  paused: 'Pausada',
}

export default function AssinaturaPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sub, setSub] = useState<SubStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const successParam = searchParams.get('success')
  const canceledParam = searchParams.get('canceled')

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/minha-conta/assinatura')
    }
  }, [authStatus, router])

  useEffect(() => {
    if (authStatus !== 'authenticated') return
    fetch('/api/subscription/status')
      .then((r) => r.json())
      .then(setSub)
      .catch(() => setSub({ isActive: false, status: null, currentPeriodEnd: null }))
      .finally(() => setLoading(false))
  }, [authStatus, successParam])

  async function handleCheckout() {
    setActionLoading(true)
    try {
      const res = await fetch('/api/subscription/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? 'Erro ao iniciar checkout')
      }
    } finally {
      setActionLoading(false)
    }
  }

  async function handlePortal() {
    setActionLoading(true)
    try {
      const res = await fetch('/api/subscription/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? 'Erro ao abrir portal')
      }
    } finally {
      setActionLoading(false)
    }
  }

  if (authStatus === 'loading' || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!session) return null

  const periodEndDate = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : null

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
        <Sparkles className="h-6 w-6 text-yellow-500" />
        Minha Assinatura
      </h1>

      {/* Toast de retorno do Stripe */}
      {successParam && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          Assinatura ativada com sucesso! Obrigado por assinar o TodaAtividade.
        </div>
      )}
      {canceledParam && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          <XCircle className="h-4 w-4 flex-shrink-0" />
          O checkout foi cancelado. Sua assinatura não foi alterada.
        </div>
      )}

      {sub?.isActive ? (
        /* ── Assinante ativo ──────────────────────────────────────────────────── */
        <div className="mt-8 space-y-6">
          {/* Status card */}
          <div className="rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-white shadow">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700">
                  Plano Assinante
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {STATUS_LABELS[sub.status ?? ''] ?? sub.status}
                </p>
              </div>
            </div>

            {periodEndDate && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-yellow-600" />
                Próxima renovação: <span className="font-medium text-gray-900">{periodEndDate}</span>
              </div>
            )}
          </div>

          {/* Benefícios */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Seus benefícios ativos</h2>
            <ul className="space-y-2">
              {[
                'Download ilimitado de todas as atividades',
                'Acesso antecipado a novos conteúdos',
                'Suporte prioritário via e-mail',
                'Sem anúncios',
              ].map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Gerenciar no portal Stripe */}
          <button
            onClick={handlePortal}
            disabled={actionLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Gerenciar assinatura / Cancelar
          </button>
        </div>
      ) : (
        /* ── Não assinante ────────────────────────────────────────────────────── */
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-yellow-400" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Acesse tudo por um preço único
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Assine e faça download de qualquer atividade sem limitações.
              Cancele quando quiser.
            </p>

            <ul className="mt-6 space-y-2 text-left max-w-xs mx-auto">
              {[
                'Downloads ilimitados de todas as atividades',
                'Novos conteúdos toda semana',
                'Acesso imediato após a assinatura',
                'Cancele a qualquer momento',
              ].map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                  {b}
                </li>
              ))}
            </ul>

            <button
              onClick={handleCheckout}
              disabled={actionLoading}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Assinar agora <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {sub?.status === 'canceled' && (
            <p className="text-center text-xs text-gray-500">
              Sua assinatura anterior foi cancelada. Assine novamente para recuperar o acesso.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
