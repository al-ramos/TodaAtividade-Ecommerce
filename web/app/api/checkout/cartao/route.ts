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

  const { cardToken, paymentMethodId, items } = parsed.data
  const totalCents = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalBRL = totalCents / 100

  // 1. Criar pedido no Supabase
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: session.user.id,
      status: 'pending',
      payment_method: 'credit_card',
      total: totalCents,
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
        token: cardToken,
        description: `TodaAtividade — ${items.length} atividade(s)`,
        installments: 1,
        payment_method_id: paymentMethodId,
        payer: {
          email: session.user.email,
          first_name: firstName,
          last_name: lastName,
        },
        external_reference: order.id as string,
        additional_info: {
          items: items.map((i) => ({
            id: i.product_id,
            title: i.title,
            quantity: i.quantity,
            unit_price: i.price / 100,
          })),
        },
      },
      requestOptions: { idempotencyKey: order.id as string },
    })
  } catch (err) {
    console.error('[cartao] MP error:', err)
    await supabaseAdmin
      .from('orders')
      .update({ status: 'failed' })
      .eq('id', order.id as string)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento. Tente novamente.' },
      { status: 502 },
    )
  }

  // 4. Atualizar pedido com resultado do MP
  const mpStatus = mpPayment.status
  const updatePayload: Record<string, unknown> = {
    payment_id: String(mpPayment.id),
  }
  if (mpStatus === 'approved') {
    updatePayload.status = 'paid'
    updatePayload.paid_at = new Date().toISOString()
  } else if (mpStatus === 'rejected') {
    updatePayload.status = 'failed'
  }

  await supabaseAdmin
    .from('orders')
    .update(updatePayload)
    .eq('id', order.id as string)

  return NextResponse.json(
    {
      order_id: order.id,
      payment_id: mpPayment.id,
      status: mpStatus,
      status_detail: mpPayment.status_detail,
    },
    {
      status: mpStatus === 'approved' ? 201 : mpStatus === 'rejected' ? 402 : 200,
    },
  )
}
