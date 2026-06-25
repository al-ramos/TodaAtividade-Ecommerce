import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

type Period = 'today' | '7d' | '30d' | '90d'

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase())
  return adminEmails.includes(email.toLowerCase())
}

function getStartDate(period: Period): Date {
  const now = new Date()
  switch (period) {
    case 'today': {
      const d = new Date(now)
      d.setHours(0, 0, 0, 0)
      return d
    }
    case '7d': {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      return d
    }
    case '30d': {
      const d = new Date(now)
      d.setDate(d.getDate() - 30)
      return d
    }
    case '90d': {
      const d = new Date(now)
      d.setDate(d.getDate() - 90)
      return d
    }
  }
}

function buildDateRange(start: Date, end: Date): string[] {
  const dates: string[] = []
  const cursor = new Date(start)
  cursor.setHours(0, 0, 0, 0)
  const endDay = new Date(end)
  endDay.setHours(23, 59, 59, 999)
  while (cursor <= endDay) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const raw = searchParams.get('period') ?? '30d'
  const period: Period = (['today', '7d', '30d', '90d'] as const).includes(raw as Period)
    ? (raw as Period)
    : '30d'

  const startDate = getStartDate(period)
  const startISO = startDate.toISOString()
  const now = new Date()

  // ── Pedidos pagos no período ───────────────────────────────────────────────
  const { data: ordersData } = await supabaseAdmin
    .from('orders')
    .select('id, total, created_at')
    .eq('status', 'paid')
    .gte('created_at', startISO)

  const paidOrders = ordersData ?? []
  const revenue = paidOrders.reduce((sum, o) => sum + (o.total as number), 0)
  const ordersCount = paidOrders.length
  const avgTicket = ordersCount > 0 ? Math.round(revenue / ordersCount) : 0

  // ── Novos usuários ─────────────────────────────────────────────────────────
  const { count: newUsersCount } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startISO)

  // ── Receita por dia ────────────────────────────────────────────────────────
  const allDates = buildDateRange(startDate, now)
  const byDayMap: Record<string, number> = Object.fromEntries(allDates.map((d) => [d, 0]))
  for (const order of paidOrders) {
    const day = (order.created_at as string).slice(0, 10)
    if (day in byDayMap) byDayMap[day] += order.total as number
  }
  const revenueByDay = allDates.map((date) => ({ date, revenue: byDayMap[date] }))

  // ── Top produtos ───────────────────────────────────────────────────────────
  const orderIds = paidOrders.map((o) => o.id as string)
  let topProducts: Array<{ productId: string; title: string; sales: number; revenue: number }> = []

  if (orderIds.length > 0) {
    const { data: itemsData } = await supabaseAdmin
      .from('order_items')
      .select('product_id, price_at_purchase, products(title)')
      .in('order_id', orderIds)

    const productMap: Record<string, { title: string; sales: number; revenue: number }> = {}
    for (const item of itemsData ?? []) {
      const productId = item.product_id as string
      const title = (item.products as unknown as { title: string } | null)?.title ?? productId
      const price = item.price_at_purchase as number
      if (!productMap[productId]) {
        productMap[productId] = { title, sales: 0, revenue: 0 }
      }
      productMap[productId].sales += 1
      productMap[productId].revenue += price
    }

    topProducts = Object.entries(productMap)
      .map(([productId, entry]) => ({ productId, ...entry }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }

  return NextResponse.json({
    revenue,
    orders: ordersCount,
    avgTicket,
    newUsers: newUsersCount ?? 0,
    topProducts,
    revenueByDay,
  })
}
