'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import {
  X,
  Download,
  ShoppingBag,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { formatPrice } from '@/lib/types'
import type { OrderWithDetails } from '@/app/admin/pedidos/page'

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'all',     label: 'Todos'    },
  { value: 'paid',    label: 'Pago'     },
  { value: 'pending', label: 'Pendente' },
  { value: 'failed',  label: 'Falhou'   },
  { value: 'expired', label: 'Expirado' },
]

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  paid:    { label: 'Pago',      cls: 'bg-green-100 text-green-700'  },
  pending: { label: 'Pendente',  cls: 'bg-yellow-100 text-yellow-700' },
  failed:  { label: 'Falhou',    cls: 'bg-red-100 text-red-700'      },
  expired: { label: 'Expirado',  cls: 'bg-gray-100 text-gray-500'    },
}

const METHOD_LABEL: Record<string, string> = {
  pix:         'Pix',
  credit_card: 'Cartão',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PedidosClientProps {
  orders: OrderWithDetails[]
  currentStatus:  string
  currentDateFrom: string
  currentDateTo:   string
  currentSort:     string
  currentSortDir:  string
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function PedidosClient({
  orders,
  currentStatus,
  currentDateFrom,
  currentDateTo,
  currentSort,
  currentSortDir,
}: PedidosClientProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)

  // Navega para nova URL com o param atualizado, mantendo os demais
  function updateParam(key: string, value: string) {
    const params = new URLSearchParams()
    if (currentStatus  && currentStatus  !== 'all') params.set('status',    currentStatus)
    if (currentDateFrom)                             params.set('date_from', currentDateFrom)
    if (currentDateTo)                               params.set('date_to',   currentDateTo)
    if (currentSort    !== 'created_at')             params.set('sort',      currentSort)
    if (currentSortDir !== 'desc')                   params.set('sort_dir',  currentSortDir)

    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  function toggleSort(field: string) {
    const params = new URLSearchParams()
    if (currentStatus  && currentStatus  !== 'all') params.set('status',   currentStatus)
    if (currentDateFrom)                             params.set('date_from',currentDateFrom)
    if (currentDateTo)                               params.set('date_to',  currentDateTo)

    if (currentSort === field) {
      params.set('sort',     field)
      params.set('sort_dir', currentSortDir === 'desc' ? 'asc' : 'desc')
    } else {
      params.set('sort',     field)
      params.set('sort_dir', 'desc')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  // ─── Exportar CSV ────────────────────────────────────────────────────────
  function exportCSV() {
    const headers = ['ID', 'Data', 'Cliente', 'Email', 'Itens', 'Total (R$)', 'Método', 'Status']
    const rows = orders.map((o) => [
      o.id.slice(0, 8),
      fmtDate(o.created_at),
      o.users?.name  ?? '',
      o.users?.email ?? '',
      String(o.order_items?.length ?? 0),
      (o.total / 100).toFixed(2).replace('.', ','),
      METHOD_LABEL[o.payment_method] ?? o.payment_method,
      STATUS_BADGE[o.status]?.label ?? o.status,
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `pedidos_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Ícone de ordenação ───────────────────────────────────────────────────
  function SortIcon({ field }: { field: string }) {
    if (currentSort !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
    return currentSortDir === 'asc'
      ? <ArrowUp   className="h-3.5 w-3.5 text-blue-600" />
      : <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Barra de filtros + ações */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Filtro de status */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          {STATUS_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateParam('status', value)}
              className={[
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                currentStatus === value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Data de */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">De</label>
          <input
            type="date"
            value={currentDateFrom}
            onChange={(e) => updateParam('date_from', e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Data até */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Até</label>
          <input
            type="date"
            value={currentDateTo}
            onChange={(e) => updateParam('date_to', e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Exportar CSV */}
        <div className="ml-auto">
          <button
            type="button"
            onClick={exportCSV}
            disabled={orders.length === 0}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabela */}
      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">Nenhum pedido encontrado com os filtros aplicados.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Itens
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <button
                    type="button"
                    onClick={() => toggleSort('total')}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    Total <SortIcon field="total" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Método
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <button
                    type="button"
                    onClick={() => toggleSort('created_at')}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    Data <SortIcon field="created_at" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => {
                const badge = STATUS_BADGE[o.status] ?? { label: o.status, cls: 'bg-gray-100 text-gray-500' }
                return (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="cursor-pointer hover:bg-blue-50 transition-colors"
                    title="Clique para ver detalhes"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {o.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{o.users?.name  ?? '—'}</p>
                      <p className="text-xs text-gray-400">{o.users?.email ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {o.order_items?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatPrice(o.total)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {METHOD_LABEL[o.payment_method] ?? o.payment_method}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {fmtDate(o.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer de detalhes do pedido */}
      <Dialog.Root
        open={selectedOrder !== null}
        onOpenChange={(open) => { if (!open) setSelectedOrder(null) }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl focus:outline-none"
            aria-describedby="order-detail-desc"
          >
            {selectedOrder && (
              <>
                {/* Header */}
                <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
                  <div>
                    <Dialog.Title className="text-base font-semibold text-gray-900">
                      Pedido #{selectedOrder.id.slice(0, 8)}
                    </Dialog.Title>
                    <p id="order-detail-desc" className="text-xs text-gray-500">
                      {fmtDate(selectedOrder.created_at)}
                    </p>
                  </div>
                  <Dialog.Close className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Fechar</span>
                  </Dialog.Close>
                </div>

                {/* Body */}
                <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">

                  {/* Status + Método */}
                  <div className="flex flex-wrap items-center gap-2">
                    {(() => {
                      const s = STATUS_BADGE[selectedOrder.status] ?? {
                        label: selectedOrder.status,
                        cls: 'bg-gray-100 text-gray-500',
                      }
                      return (
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`}>
                          {s.label}
                        </span>
                      )
                    })()}
                    <span className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600">
                      {METHOD_LABEL[selectedOrder.payment_method] ?? selectedOrder.payment_method}
                    </span>
                    {selectedOrder.paid_at && (
                      <span className="text-xs text-gray-400">
                        Pago em {fmtDate(selectedOrder.paid_at)}
                      </span>
                    )}
                  </div>

                  {/* Cliente */}
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Cliente
                    </h3>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="text-sm font-medium text-gray-900">
                        {selectedOrder.users?.name ?? '—'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedOrder.users?.email ?? '—'}
                      </p>
                    </div>
                  </div>

                  {/* Itens comprados */}
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Itens comprados ({selectedOrder.order_items?.length ?? 0})
                    </h3>
                    <div className="space-y-2">
                      {(selectedOrder.order_items ?? []).length === 0 ? (
                        <p className="text-xs text-gray-400">Nenhum item encontrado.</p>
                      ) : (
                        (selectedOrder.order_items ?? []).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                          >
                            <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded border border-gray-100 bg-gray-50">
                              {item.products?.thumbnail_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.products.thumbnail_url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-gray-100" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-medium text-gray-900">
                                {item.products?.title ?? 'Atividade removida'}
                              </p>
                            </div>
                            <p className="flex-shrink-0 text-sm font-semibold text-gray-900">
                              {formatPrice(item.price_at_purchase)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Total</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(selectedOrder.total)}
                      </span>
                    </div>
                    {selectedOrder.payment_id && (
                      <p className="mt-1 text-xs text-gray-400">
                        ID pagamento:{' '}
                        <span className="font-mono">{selectedOrder.payment_id}</span>
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
