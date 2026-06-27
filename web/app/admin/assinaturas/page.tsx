'use client'

import { useEffect, useState } from 'react'
import { Sparkles, CheckCircle, XCircle, Clock } from 'lucide-react'

type Subscription = {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  stripe_price_id: string
  status: string
  current_period_end: string
  created_at: string
  updated_at: string
  // joined
  email?: string
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  trialing: 'bg-blue-100 text-blue-800',
  past_due: 'bg-yellow-100 text-yellow-800',
  canceled: 'bg-gray-100 text-gray-600',
  unpaid: 'bg-red-100 text-red-800',
  incomplete: 'bg-orange-100 text-orange-800',
  paused: 'bg-purple-100 text-purple-800',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativa',
  trialing: 'Trial',
  past_due: 'Em atraso',
  canceled: 'Cancelada',
  unpaid: 'Não paga',
  incomplete: 'Incompleta',
  paused: 'Pausada',
}

export default function AdminAssinaturasPage() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'canceled'>('all')

  useEffect(() => {
    fetch('/api/admin/assinaturas')
      .then((r) => r.json())
      .then((data) => setSubs(data.subscriptions ?? []))
      .catch(() => setSubs([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = subs.filter((s) => {
    if (filter === 'active') return s.status === 'active' || s.status === 'trialing'
    if (filter === 'canceled') return s.status === 'canceled'
    return true
  })

  const activeCount = subs.filter((s) => s.status === 'active' || s.status === 'trialing').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Sparkles className="h-5 w-5 text-yellow-500" /> Assinaturas Stripe
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {activeCount} ativa{activeCount !== 1 ? 's' : ''} · {subs.length} total
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(['all', 'active', 'canceled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'active' ? 'Ativas' : 'Canceladas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">Nenhuma assinatura encontrada.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500">
                <th className="px-4 py-3">Usuário</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Próx. cobrança</th>
                <th className="px-4 py-3">Subscription ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{s.email ?? '—'}</div>
                    <div className="text-xs text-gray-400 font-mono">{s.user_id.slice(0, 8)}…</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[s.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.status === 'active' || s.status === 'trialing' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : s.status === 'canceled' ? (
                        <XCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.current_period_end
                      ? new Date(s.current_period_end).toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://dashboard.stripe.com/subscriptions/${s.stripe_subscription_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-blue-600 hover:underline"
                    >
                      {s.stripe_subscription_id.slice(0, 20)}…
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
