import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import MercadoPagoConfig, { Payment } from 'mercadopago'

// ─── Mercado Pago client (lazy singleton) ─────────────────────────────────────
function getMPClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  })
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const bodySchema = z.object({
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

// ─── POST /api/checkout/criar-pix ─────────────────────────────────────────────
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

  const { items } = parsed.data
  const totalCents = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalBRL = totalCents / 100

  // 1. Criar pedido no Supabase
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: session.user.id,
      status: 'pending',
      payment_method: 'pix',
      total: totalCents,
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error('[criar-pix] order error:', orderError)
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }

  // 2. Inserir itens do pedido
  const orderItems = items.map((i) => ({
    order_id: order.id as string,
    product_id: i.product_id,
    price_at_purchase: i.price,
  }))

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('[criar-pix] order_items error:', itemsError)
    // Não bloqueia — o pedido já foi criado
  }

  // 3. Criar pagamento Pix no Mercado Pago
  const [firstName, ...nameParts] = (session.user.name ?? session.user.email).split(' ')
  const lastName = nameParts.join(' ') || firstName

  let mpPayment
  try {
    const paymentClient = new Payment(getMPClient())
    mpPayment = await paymentClient.create({
      body: {
        transaction_amount: totalBRL,
        description: `TodaAtividade — ${items.length} atividade(s)`,
        payment_method_id: 'pix',
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
    })
  } catch (err) {
    console.error('[criar-pix] MP error:', err)
    // Marcar pedido como falho
    await supabaseAdmin
      .from('orders')
      .update({ status: 'failed' })
      .eq('id', order.id as string)
    return NextResponse.json(
      { error: 'Erro ao gerar pagamento Pix. Tente novamente.' },
      { status: 502 },
    )
  }

  // 4. Salvar payment_id no pedido
  await supabaseAdmin
    .from('orders')
    .update({ payment_id: String(mpPayment.id) })
    .eq('id', order.id as string)

  const txData = mpPayment.point_of_interaction?.transaction_data

  return NextResponse.json(
    {
      order_id: order.id,
      payment_id: mpPayment.id,
      qr_code: txData?.qr_code ?? null,
      qr_code_base64: txData?.qr_code_base64 ?? null,
      total_cents: totalCents,
    },
    { status: 201 },
  )
}
