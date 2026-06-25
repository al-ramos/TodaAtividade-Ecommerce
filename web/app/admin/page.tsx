'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Upload, TrendingUp, ShoppingBag, Users, BarChart2 } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatPrice } from '@/lib/types'

type Period = 'today' | '7d' | '30d' | '90d'

interface TopProduct {
  productId: string
  title: string
  sales: number
  revenue: number
}

interface RevenueDay {
  date: string
  revenue: number
}

interface StatsData {
  revenue: number
  orders: number
  avgTicket: number
  newUsers: number
  topProducts: TopProduct[]
  revenueByDay: RevenueDay[]
}

const PERIODS: { label: string; value: Period }[] = [
  { label: 'Hoje', value: 'today' },
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: '90 dias', value: '90d' },
]

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>('30d')
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setData(null)
    fetch(`/api/admin/stats?period=${period}`)
      .then((res) => res.json())
      .then((json: StatsData) => setData(json))
      .finally(() => setLoading(false))
  }, [period])

  const kpis = [
    {
      label: 'Receita total',
      value: data ? formatPrice(data.revenue) : '—',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      label: 'Pedidos pagos',
      value: data ? String(data.orders) : '—',
      icon: ShoppingBag,
      color: 'text-green-600 bg-green-100',
    },
    {
      label: 'Ticket médio',
      value: data ? formatPrice(data.avgTicket) : '—',
      icon: BarChart2,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Novos usuários',
      value: data ? String(data.newUsers) : '—',
      icon: Users,
      color: 'text-orange-600 bg-orange-100',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Relatórios e métricas da plataforma</p>
        </div>
        <Link
          href="/admin/atividades/nova"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Upload className="h-4 w-4" />
          Nova atividade
        </Link>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {PERIODS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              period === value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, color }) =>
          loading ? (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 animate-pulse bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 animate-pulse bg-gray-200 rounded w-3/4" />
                  <div className="h-6 animate-pulse bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ) : (
            <div
              key={label}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className={`rounded-xl p-3 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Revenue chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Receita por dia</h2>
        {loading ? (
          <div className="h-48 animate-pulse bg-gray-200 rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={data?.revenueByDay ?? []}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `R$${(v / 100).toFixed(0)}`}
                width={56}
              />
              <Tooltip
                formatter={(value: number) => [formatPrice(value), 'Receita']}
                labelFormatter={(label: string) => `Dia ${label}`}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top products */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Top 5 produtos</h2>
        </div>
        {loading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 flex-1 animate-pulse bg-gray-200 rounded" />
                <div className="h-4 w-16 animate-pulse bg-gray-200 rounded" />
                <div className="h-4 w-20 animate-pulse bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500">
                <th className="px-6 py-3 text-left font-medium">Produto</th>
                <th className="px-6 py-3 text-right font-medium">Vendas</th>
                <th className="px-6 py-3 text-right font-medium">Receita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data?.topProducts ?? []).length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                    Nenhuma venda no período
                  </td>
                </tr>
              ) : (
                (data?.topProducts ?? []).map((p) => (
                  <tr key={p.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-700 max-w-xs truncate">{p.title}</td>
                    <td className="px-6 py-3 text-right text-gray-600">{p.sales}</td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">
                      {formatPrice(p.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
