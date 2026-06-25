import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/favoritos — lista IDs dos produtos favoritados
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select('product_id')
    .eq('user_id', session.user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ productIds: data.map((f) => f.product_id) })
}

// POST /api/favoritos — adiciona favorito
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const productId = body?.productId as string | undefined

  if (!productId) {
    return NextResponse.json({ error: 'productId é obrigatório' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('favorites')
    .upsert(
      { user_id: session.user.id, product_id: productId },
      { onConflict: 'user_id,product_id', ignoreDuplicates: true },
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}

// DELETE /api/favoritos?productId=xxx — remove favorito
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const productId = req.nextUrl.searchParams.get('productId')
  if (!productId) {
    return NextResponse.json({ error: 'productId é obrigatório' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('favorites')
    .delete()
    .eq('user_id', session.user.id)
    .eq('product_id', productId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
