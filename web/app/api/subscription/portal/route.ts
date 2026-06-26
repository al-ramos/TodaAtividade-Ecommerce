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

  const sub = await getUserSubscriptionStatus(session.user.id)
  if (!sub.stripeCustomerId) {
    return NextResponse.json(
      { error: 'Nenhuma assinatura encontrada para este usuário' },
      { status: 404 },
    )
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${BASE_URL}/minha-conta/assinatura`,
  })

  return NextResponse.json({ url: portalSession.url })
}
