import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

type Params = { params: { productId: string } }

// ─── GET /api/avaliacoes/[productId] ──────────────────────────────────────────
// Retorna { reviews, averageRating, totalCount, distribution, userReview }
export async function GET(req: Request, { params }: Params) {
  const { productId } = params
  const session = await getServerSession(authOptions)

  const { data: reviews, error } = await supabaseAdmin
    .from('reviews')
    .select('id, user_id, rating, comment, created_at, updated_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar avaliações' }, { status: 500 })
  }

  const totalCount = reviews?.length ?? 0
  const averageRating =
    totalCount > 0
      ? reviews!.reduce((sum, r) => sum + r.rating, 0) / totalCount
      : 0

  // distribuição 1-5
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews?.forEach((r) => { distribution[r.rating] = (distribution[r.rating] ?? 0) + 1 })

  // enriquecer com nome mascarado
  const enriched = await Promise.all(
    (reviews ?? []).map(async (r) => {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(r.user_id)
      const fullName: string = userData?.user?.user_metadata?.full_name ?? userData?.user?.email ?? ''
      const parts = fullName.trim().split(' ').filter(Boolean)
      const maskedName =
        parts.length >= 2
          ? `${parts[0][0]}. ${parts[parts.length - 1][0]}.`
          : parts[0]?.[0]
          ? `${parts[0][0]}.`
          : 'Anônimo'
      return { ...r, maskedName }
    }),
  )

  const userReview = session?.user?.id
    ? enriched.find((r) => r.user_id === session.user!.id) ?? null
    : null

  return NextResponse.json({
    reviews: enriched,
    averageRating: Math.round(averageRating * 10) / 10,
    totalCount,
    distribution,
    userReview,
  })
}

// ─── POST /api/avaliacoes/[productId] ─────────────────────────────────────────
// Cria ou atualiza avaliação. Requer auth + pedido pago com esse produto.
export async function POST(req: Request, { params }: Params) {
  const { productId } = params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Verifica se comprou o produto
  const { data: orderItem } = await supabaseAdmin
    .from('order_items')
    .select('order_id, orders!inner(status)')
    .eq('product_id', productId)
    .eq('orders.user_id', session.user.id)
    .eq('orders.status', 'paid')
    .limit(1)
    .maybeSingle()

  if (!orderItem) {
    return NextResponse.json(
      { error: 'Você só pode avaliar produtos que comprou.' },
      { status: 403 },
    )
  }

  const body = await req.json()
  const rating = Number(body.rating)
  const comment: string | null = body.comment?.trim() || null

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating inválido (1-5)' }, { status: 400 })
  }
  if (comment && comment.length > 500) {
    return NextResponse.json({ error: 'Comentário muito longo (máx 500 chars)' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .upsert(
      {
        user_id: session.user.id,
        product_id: productId,
        order_id: (orderItem as any).order_id,
        rating,
        comment,
      },
      { onConflict: 'user_id,product_id' },
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Erro ao salvar avaliação' }, { status: 500 })
  }

  return NextResponse.json({ review: data })
}

// ─── DELETE /api/avaliacoes/[productId] ───────────────────────────────────────
export async function DELETE(_req: Request, { params }: Params) {
  const { productId } = params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { error } = await supabaseAdmin
    .from('reviews')
    .delete()
    .eq('user_id', session.user.id)
    .eq('product_id', productId)

  if (error) {
    return NextResponse.json({ error: 'Erro ao remover avaliação' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
