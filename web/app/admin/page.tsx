import Link from 'next/link'
import { BookOpen, ShoppingBag, Upload, TrendingUp } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { formatPrice } from '@/lib/types'

async function getStats() {
  const [{ count: totalProducts }, { count: totalOrders }, { data: revenueData }] =
    await Promise.all([
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
      supabaseAdmin.from('orders').select('total').eq('status', 'paid'),
    ])

  const revenue = (revenueData ?? []).reduce((sum, o) => sum + (o.total as number), 0)

  return {
    totalProducts: totalProducts ?? 0,
    totalOrders: totalOrders ?? 0,
    revenue,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const cards = [
    {
      label: 'Atividades cadastradas',
      value: stats.totalProducts,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-100',
      href: '/admin/atividades',
    },
    {
      label: 'Pedidos pagos',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-green-600 bg-green-100',
      href: '/admin/pedidos',
    },
    {
      label: 'Receita total',
      value: formatPrice(stats.revenue),
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-100',
      href: '/admin/pedidos',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Visão geral da plataforma</p>
        </div>
        <Link
          href="/admin/atividades/nova"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Upload className="h-4 w-4" />
          Nova atividade
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`rounded-xl p-3 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
        <Upload className="mx-auto h-10 w-10 text-gray-300" />
        <h3 className="mt-3 text-sm font-semibold text-gray-700">Adicionar nova atividade</h3>
        <p className="mt-1 text-xs text-gray-500">
          Faça upload do PDF, preencha os metadados e publique no catálogo.
        </p>
        <Link
          href="/admin/atividades/nova"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Cadastrar atividade
        </Link>
      </div>
    </div>
  )
}
