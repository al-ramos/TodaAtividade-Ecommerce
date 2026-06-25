import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import type { CartItem } from '@/lib/types'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const items = body?.items as CartItem[] | undefined

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'items deve ser um array' }, { status: 400 })
  }

  if (items.length === 0) {
    await supabaseAdmin
      .from('abandoned_carts')
      .delete()
      .eq('user_id', session.user.id)

    return NextResponse.json({ ok: true })
  }

  const { error } = await supabaseAdmin
    .from('abandoned_carts')
    .upsert(
      {
        user_id: session.user.id,
        email: session.user.email,
        items,
        reminder_sent_at: null,
        converted_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
