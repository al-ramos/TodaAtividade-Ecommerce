import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, PackageOpen } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { PedidoCard, type Order } from './_components/PedidoCard'
import { Paginacao } from './_components/Paginacao'

export const metadata: Metadata = {
  title: 'Minhas Compras',
  robots: { index: false, follow: false },
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: { page?: string }
}

export default async function PedidosPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login?callbackUrl=/minha-conta/pedidos')

  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: orders, error, count } = await supabaseAdmin
    .from('orders')
    .select(
      `
      id,
      created_at,
      total_amount,
      status,
      order_items (
        product_id,
        products!product_id (
          title,
          thumbnail_url
        )
      )
    `,
      { count: 'exact' },
    )
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('[pedidos] Erro ao buscar pedidos:', error)
  }

  const typedOrders = (orders ?? []) as unknown as Order[]
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-2xl px-4">

        {/* Cabeçalho */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/perfil"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Voltar ao perfil"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minhas Compras</h1>
            <p className="text-sm text-gray-500">Histórico de pedidos e downloads</p>
          </div>
        </div>

        {/* Estado vazio */}
        {typedOrders.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-200">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
              <PackageOpen className="h-10 w-10 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">Você ainda não fez nenhuma compra</p>
              <p className="mt-1 text-sm text-gray-500">
                Explore o catálogo e encontre atividades incríveis para sua turma.
              </p>
            </div>
            <Link
              href="/atividades"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Explorar atividades
            </Link>
          </div>
        )}

        {/* Lista de pedidos */}
        {typedOrders.length > 0 && (
          <div className="space-y-3">
            {typedOrders.map((order) => (
              <PedidoCard key={order.id} order={order} />
            ))}

            <Paginacao page={page} totalPages={totalPages} />
          </div>
        )}

      </div>
    </div>
  )
}
