import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'
import { buildAbandonedCartHtml } from '@/lib/email-templates/abandoned-cart'
import type { CartItem } from '@/lib/types'

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder')
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://todaatividade.com.br'
const CART_URL = `${APP_URL}/carrinho`

interface AbandonedCart {
  id: string
  email: string
  items: CartItem[]
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabaseAdmin
    .from('abandoned_carts')
    .select('id, email, items')
    .is('converted_at', null)
    .is('reminder_sent_at', null)
    .lt('updated_at', cutoff)
    .neq('items', '[]')
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const carts = (data ?? []) as AbandonedCart[]
  let sent = 0

  for (const cart of carts) {
    const html = buildAbandonedCartHtml({
      items: cart.items,
      cartUrl: CART_URL,
    })

    const { error: sendError } = await resend.emails.send({
      from: 'TodaAtividade <noreply@todaatividade.com.br>',
      to: cart.email,
      subject: 'Você esqueceu algo no carrinho 🛒',
      html,
    })

    if (sendError) continue

    await supabaseAdmin
      .from('abandoned_carts')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('id', cart.id)

    sent++
  }

  return NextResponse.json({ sent })
}
