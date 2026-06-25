import { supabaseAdmin } from '@/lib/supabase'
import PedidosClient from '@/components/admin/PedidosClient'

// Tipo exportado (usado pelo PedidosClient)

export type OrderWithDetails = {
  id: string
  status: string
  total: number
  payment_method: string
  payment_id?: string | null
  created_at: string
  paid_at?: string | null
  users?: { name: string | null; email: string | null } | null
  order_items?: Array<{
    id: string
    price_at_purchase: number
    products?: {
      id: string
      title: string
      thumbnail_url: string | null
      slug: string
    } | null
  }>
}

// Data fetching

async function getOrders(
  status: string,
  dateFrom: string,
  dateTo: string,
  sort: string,
  sortDir: string,
): Promise<OrderWithDetails[]> {
  let query = supabaseAdmin
    .from('orders')
    .select(`
      id, status, total, payment_method, payment_id, created_at, paid_at,
      users(name, email),
      order_items(
        id, price_at_purchase,
        products(id, title, thumbnail_url, slug)
      )
    `)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (dateFrom) {
    query = query.gte('created_at', `${dateFrom}T00:00:00`)
  }

  if (dateTo) {
    query = query.lte('created_at', `${dateTo}T23:59:59`)
  }

  const ascending = sortDir === 'asc'
  const sortField = sort === 'total' ? 'total' : 'created_at'
  query = query.order(sortField, { ascending })

  const { data } = await query.limit(200)
  return (data ?? []) as unknown as OrderWithDetails[]
}

// Page

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>
}

export default async function AdminPedidosPage({ searchParams }: PageProps) {
  const sp = searchParams

  const status   = typeof sp.status    === 'string' ? sp.status    : 'all'
  const dateFrom = typeof sp.date_from === 'string' ? sp.date_from : ''
  const dateTo   = typeof sp.date_to   === 'string' ? sp.date_to   : ''
  const sort     = typeof sp.sort      === 'string' ? sp.sort      : 'created_at'
  const sortDir  = typeof sp.sort_dir  === 'string' ? sp.sort_dir  : 'desc'

  const orders = await getOrders(status, dateFrom, dateTo, sort, sortDir)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="mt-1 text-sm text-gray-500">
            {orders.length} pedido{orders.length !== 1 ? 's' : ''} encontrado{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <PedidosClient
        orders={orders}
        currentStatus={status}
        currentDateFrom={dateFrom}
        currentDateTo={dateTo}
        currentSort={sort}
        currentSortDir={sortDir}
      />
    </div>
  )
}
