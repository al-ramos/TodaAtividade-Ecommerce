import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import MercadoPagoConfig, { Payment } from 'mercadopago'

// ─── Mercado Pago client ──────────────────────────────────────────────────────
function getMPClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  })
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const bodySchema = z.object({
  cardToken: z.string().min(1, 'Token do cartão é obrigatório'),
  paymentMethodId: z.string().min(1, 'Método de pagamento é obrigatório'),
  items: z
    .array(
      z.object({
        product_id: z.string().min(1),
        title: z.string().min(1),
        price: z.number().int().positive(), // centavos
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, 'Ao menos um item é obrigatório'),
  couponId: z.string().uuid().optional(),
  discountAmount: z.number().int().min(0).optional(), // centavos
})

// ─── POST /api/checkout/cartao ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { cardToken, paymentMethodId, items, couponId, discountAmount = 0 } = parsed.data
  const totalCents = items.reduce((s, i) => s + i.price * i.quantity, 0)

  // ─── Desconto de indicação (server-side) ──────────────────────────────────
  let referralDiscountCents = 0
  let referralReferrerId: string | null = null
  const referralCookieRaw = req.cookies.get('referral_code')?.value
  const referralCookie = referralCookieRaw?.toUpperCase() ?? null

  if (referralCookie) {
    const { data: refRow } = await supabaseAdmin
      .from('user_referrals')
      .select('user_id')
      .eq('referral_code', referralCookie)
      .maybeSingle()

    // Não pode indicar a si mesmo
    if (refRow && refRow.user_id !== session.user.id) {
      const { data: existingUsage } = await supabaseAdmin
        .from('referral_usages')
        .select('id')
        .eq('referred_id', session.user.id)
        .maybeSingle()

      if (!existingUsage) {
        referralDiscountCents = Math.floor(totalCents * 0.05)
        referralReferrerId = refRow.user_id
      }
    }
  }

  const effectiveDiscountCents = discountAmount + referralDiscountCents
  const effectiveDiscountBRL = effectiveDiscountCents / 100
  const totalBRL = Math.max(0, (totalCents - effectiveDiscountCents) / 100)

  // 1. Criar pedido no Supabase
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: session.user.id,
      status: 'pending',
      payment_method: 'credit_card',
      total: totalCents,
      coupon_id: couponId ?? null,
      discount_amount: effectiveDiscountBRL,
      referral_code: referralReferrerId ? referralCookie : null,
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error('[cartao] order error:', orderError)
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }

  // 2. Inserir itens do pedido
  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(
      items.map((i) => ({
        order_id: order.id as string,
        product_id: i.product_id,
        price_at_purchase: i.price,
      })),
    )

  if (itemsError) {
    console.error('[cartao] order_items error:', itemsError)
    // Não bloqueia — o pedido já foi criado
  }

  // 2b. Registrar uso de indicação e creditar indicador
  if (referralReferrerId && referralDiscountCents > 0) {
    const { error: usageError } = await supabaseAdmin
      .from('referral_usages')
      .insert({
        referrer_id: referralReferrerId,
        referred_id: session.user.id,
        order_id: order.id as string,
        discount_cents: referralDiscountCents,
        credit_cents: 300,
      })
    if (!usageError) {
      await supabaseAdmin.rpc('add_referral_credit', {
        p_user_id: referralReferrerId,
        p_amount: 300,
      })
    }
  }

  // 3. Processar pagamento via Mercado Pago
  const nameParts = (session.user.name ?? session.user.email).split(' ')
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ') || firstName

  let mpPayment
  try {
    const paymentClient = new Payment(getMPClient())
    mpPayment = await paymentClient.create({
      body: {
        transaction_amount: totalBRL,
        description: items.map((i) => i.title).join(', '),
        payment_method_id: paymentMethodId,
        token: cardToken,
        installments: 1,
        payer: {
          email: session.user.email,
          first_name: firstName,
          last_name: lastName,
        },
        metadata: { order_id: order.id, user_id: session.user.id },
        external_reference: order.id as string,
      },
    })
  } catch (err) {
    console.error('[cartao] mp error:', err)
    return NextResponse.json({ error: 'Erro ao processar pagamento' }, { status: 500 })
  }

  // 4. Salvar payment_id e atualizar status
  await supabaseAdmin
    .from('orders')
    .update({
      payment_id: String(mpPayment.id),
      status: mpPayment.status === 'approved' ? 'paid' : mpPayment.status ?? 'pending',
    })
    .eq('id', order.id as string)

  return NextResponse.json({
    orderId: order.id,
    paymentId: mpPayment.id,
    status: mpPayment.status,
    totalBRL,
    discountBRL: effectiveDiscountBRL,
  })
}
