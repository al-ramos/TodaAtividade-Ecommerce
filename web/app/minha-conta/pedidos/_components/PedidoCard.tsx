'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp, Download, ShoppingBag } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { ReenviarEmailButton } from './ReenviarEmailButton'

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderItem = {
  product_id: string
  products: {
    title: string
    thumbnail_url: string | null
  } | null
}

export type Order = {
  id: string
  created_at: string
  total_amount: number
  status: string
  order_items: OrderItem[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100)
}

function shortId(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PedidoCardProps {
  order: Order
}

export function PedidoCard({ order }: PedidoCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isPaid = order.status === 'paid'
  const bodyId = `pedido-body-${order.id}`

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">

      {/* Header — clicável para expandir/colapsar */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={bodyId}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1">
          {/* ID + Data */}
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Pedido #{shortId(order.id)}
            </p>
            <p className="mt-0.5 text-sm text-gray-600">{formatDate(order.created_at)}</p>
          </div>

          {/* Status badge */}
          <StatusBadge status={order.status} />
        </div>

        {/* Total + chevron */}
        <div className="flex flex-shrink-0 items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(order.total_amount)}
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
          )}
        </div>
      </button>

      {/* Body — lista de itens */}
      {expanded && (
        <div id={bodyId}>
          <ul className="divide-y divide-gray-100 border-t border-gray-100">
            {order.order_items.map((item) => {
              const product = item.products
              return (
                <li key={item.product_id} className="flex items-center gap-4 px-5 py-4">
                  {/* Thumbnail */}
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {product?.thumbnail_url ? (
                      <Image
                        src={product.thumbnail_url}
                        alt={product.title ?? 'Atividade'}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Título */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {product?.title ?? 'Atividade'}
                    </p>
                    {isPaid && (
                      <p className="mt-0.5 text-xs text-gray-400">PDF disponível para download</p>
                    )}
                  </div>

                  {/* Ação de download (só se pago) */}
                  {isPaid && (
                    <a
                      href={`/api/download/${order.id}/${item.product_id}`}
                      className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                      title="Baixar PDF"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar PDF
                    </a>
                  )}
                </li>
              )
            })}
          </ul>

          {/* Footer com ações do pedido */}
          {isPaid && (
            <div className="flex items-center justify-end border-t border-gray-100 px-5 py-3">
              <ReenviarEmailButton orderId={order.id} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
