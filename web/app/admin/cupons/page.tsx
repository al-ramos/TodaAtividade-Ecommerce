'use client'

import { useEffect, useState } from 'react'
import { Tag, Plus, Loader2, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react'

type Coupon = {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_value: number
  max_uses: number | null
  used_count: number
  valid_from: string
  valid_until: string | null
  active: boolean
  created_at: string
}

const EMPTY_FORM = {
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: '',
  min_order_value: '0',
  max_uses: '',
  valid_from: new Date().toISOString().slice(0, 16),
  valid_until: '',
}

function formatValue(coupon: Coupon) {
  if (coupon.type === 'percentage') return `${coupon.value}%`
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(coupon.value)
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AdminCuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCoupons()
  }, [])

  async function fetchCoupons() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/coupons')
      const data = await res.json()
      setCoupons((data.coupons as Coupon[]) ?? [])
    } catch {
      // silently fail — empty state shown
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)

    const body = {
      code: form.code,
      type: form.type,
      value: parseFloat(form.value),
      min_order_value: parseFloat(form.min_order_value || '0'),
      max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
      valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : undefined,
      valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
    }

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        setFormError((data.error as string | undefined) ?? 'Erro ao criar cupom')
        return
      }

      setCoupons((prev) => [data.coupon as Coupon, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch {
      setFormError('Erro de conexão. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(coupon: Coupon) {
    setTogglingId(coupon.id)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: coupon.id, active: !coupon.active }),
      })
      const data = await res.json()
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? (data.coupon as Coupon) : c)),
        )
      }
    } catch {
      // silently fail
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cupons de desconto</h1>
          <p className="mt-1 text-sm text-gray-500">
            {coupons.length} cupom{coupons.length !== 1 ? 's' : ''} cadastrado{coupons.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm((v) => !v)
            setFormError(null)
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          {showForm ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Fechar' : 'Novo cupom'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-gray-200 bg-white p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            Novo cupom
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Código *</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="EX: PROMO10"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo *</label>
              <select
                required
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">Percentual (%)</option>
                <option value="fixed">Valor fixo (R$)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Valor {form.type === 'percentage' ? '(%)' : '(R$)'} *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder={form.type === 'percentage' ? '10' : '5.00'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pedido mínimo (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.min_order_value}
                onChange={(e) => setForm((f) => ({ ...f, min_order_value: e.target.value }))}
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Limite de usos</label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.max_uses}
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                placeholder="Ilimitado"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Válido a partir de</label>
              <input
                type="datetime-local"
                value={form.valid_from}
                onChange={(e) => setForm((f) => ({ ...f, valid_from: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Válido até</label>
              <input
                type="datetime-local"
                value={form.valid_until}
                onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setShowForm(false); setFormError(null) }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar cupom
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
            <Tag className="w-8 h-8" />
            <p className="text-sm">Nenhum cupom cadastrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Código</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Tipo / Valor</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Usos</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Validade</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-gray-900">{coupon.code}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        {formatValue(coupon)}
                        <span className="text-gray-400 text-xs">
                          {coupon.type === 'percentage' ? 'de desconto' : 'fixo'}
                        </span>
                      </span>
                      {coupon.min_order_value > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Mín:{' '}
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            coupon.min_order_value,
                          )}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {coupon.used_count}
                      {coupon.max_uses !== null ? `/${coupon.max_uses}` : '/∞'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {coupon.valid_until ? formatDate(coupon.valid_until) : 'Sem expiração'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(coupon)}
                        disabled={togglingId === coupon.id}
                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                        style={
                          coupon.active
                            ? { background: '#dcfce7', color: '#15803d' }
                            : { background: '#f3f4f6', color: '#6b7280' }
                        }
                      >
                        {togglingId === coupon.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : coupon.active ? (
                          <ToggleRight className="w-3.5 h-3.5" />
                        ) : (
                          <ToggleLeft className="w-3.5 h-3.5" />
                        )}
                        {coupon.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
