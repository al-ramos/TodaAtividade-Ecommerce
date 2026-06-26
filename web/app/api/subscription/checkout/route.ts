import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { authOptions } from '@/lib/auth'
import { getUserSubscriptionStatus } from '@/lib/subscription'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.todaatividade.com.br'

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Impede dupla assinatura
  const sub = await getUserSubscriptionStatus(session.user.id)
  if (sub.isActive) {
    return NextResponse.json({ error: 'Você já possui uma assinatura ativa' }, { status: 400 })
  }

  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) {
    return NextResponse.json({ error: 'STRIPE_PRICE_ID não configurado' }, { status: 500 })
  }

  // Reutiliza o customer já existente ou cria um novo
  let customerId = sub.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      name: session.user.name ?? undefined,
      metadata: { supabase_user_id: session.user.id },
    })
    customerId = customer.id
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${BASE_URL}/minha-conta/assinatura?success=1`,
    cancel_url: `${BASE_URL}/minha-conta/assinatura?canceled=1`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { supabase_user_id: session.user.id },
    },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
