'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

interface Subscriber {
  id: string
  email: string
  name: string | null
  confirmed_at: string | null
  unsubscribed_at: string | null
  created_at: string
}

type SubscriberStatus = 'confirmed' | 'unsubscribed' | 'pending'

function getStatus(s: Subscriber): SubscriberStatus {
  if (s.unsubscribed_at) return 'unsubscribed'
  if (s.confirmed_at) return 'confirmed'
  return 'pending'
}

const STATUS_LABELS: Record<SubscriberStatus, string> = {
  confirmed: 'Confirmado',
  pending: 'Pendente',
  unsubscribed: 'Cancelado',
}

const STATUS_CLASSES: Record<SubscriberStatus, string> = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  unsubscribed: 'bg-red-100 text-red-800',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function exportCsv(subscribers: Subscriber[]) {
  const header = 'id,email,name,status,subscribed_at,confirmed_at,unsubscribed_at'
  const rows = subscribers.map((s) => {
    const status = getStatus(s)
    const esc = (v: string | null) => (v ? `"${v.replace(/"/g, '""')}"` : '')
    return [s.id, esc(s.email), esc(s.name), status, esc(s.created_at), esc(s.confirmed_at), esc(s.unsubscribed_at)].join(',')
  })
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'newsletter.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/newsletter')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSubscribers(data)
        } else {
          setError(data.error ?? 'Erro ao carregar inscritos.')
        }
      })
      .catch(() => setError('Erro de rede.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Newsletter</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {loading ? '…' : `${subscribers.length} inscrito${subscribers.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => exportCsv(subscribers)}
          disabled={subscribers.length === 0}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">E-mail</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Inscrito em</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">
                  Carregando…
                </td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">
                  Nenhum inscrito ainda.
                </td>
              </tr>
            ) : (
              subscribers.map((s) => {
                const status = getStatus(s)
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{s.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}>
                        {STATUS_LABELS[status]}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
