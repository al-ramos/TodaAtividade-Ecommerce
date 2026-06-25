export type OrderStatus = 'paid' | 'pending' | 'failed' | 'cancelled'

const config: Record<OrderStatus, { label: string; className: string }> = {
  paid: {
    label: '✅ Pago',
    className: 'bg-green-100 text-green-700 ring-green-200',
  },
  pending: {
    label: '⏳ Processando',
    className: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
  },
  failed: {
    label: '❌ Falhou',
    className: 'bg-red-100 text-red-700 ring-red-200',
  },
  cancelled: {
    label: '❌ Cancelado',
    className: 'bg-red-100 text-red-700 ring-red-200',
  },
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = config[status as OrderStatus] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-600 ring-gray-200',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cfg.className}`}
    >
      {cfg.label}
    </span>
  )
}
