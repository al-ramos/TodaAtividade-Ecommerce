import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
})

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Sem assinatura Stripe' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
  } catch (err) {
    console.error('[stripe-webhook] Assinatura inválida:', err)
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  try {
    switch (event.type) {
      // Subscription criada ou atualizada (também cobre trialing → active)
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        if (!userId) {
          console.warn('[stripe-webhook] subscription sem supabase_user_id:', sub.id)
          break
        }

        await supabaseAdmin.from('subscriptions').upsert(
          {
            user_id: userId,
            stripe_customer_id: sub.customer as string,
            stripe_subscription_id: sub.id,
            stripe_price_id: sub.items.data[0].price.id,
            status: sub.status,
            current_period_end: new Date(
              (sub as unknown as { current_period_end: number }).current_period_end * 1000,
            ).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )
        console.info('[stripe-webhook] subscription upsert OK:', sub.id, sub.status)
        break
      }

      // Assinatura cancelada (definitivamente)
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'canceled', updated_at: new Date().toISOString() })
          .eq('user_id', userId)
        console.info('[stripe-webhook] subscription cancelada:', sub.id)
        break
      }

      // Pagamento da fatura bem-sucedido → garante status active
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = (invoice as unknown as { subscription: string }).subscription
        if (!subId) break

        const sub = await stripe.subscriptions.retrieve(subId)
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: sub.status,
            current_period_end: new Date(
              (sub as unknown as { current_period_end: number }).current_period_end * 1000,
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
        break
      }

      // Pagamento falhou → pode mudar para past_due
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = (invoice as unknown as { subscription: string }).subscription
        if (!subId) break

        const sub = await stripe.subscriptions.retrieve(subId)
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        await supabaseAdmin
          .from('subscriptions')
          .update({ status: sub.status, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
        break
      }

      default:
        // Ignora eventos não tratados
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[stripe-webhook] Erro no handler:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
