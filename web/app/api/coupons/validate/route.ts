import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'

const bodySchema = z.object({
  code: z.string().min(1),
  orderTotal: z.number().int().positive(), // centavos
})

// ─── POST /api/coupons/validate ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ valid: false, error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: 'Dados inválidos' }, { status: 422 })
  }

  const { code, orderTotal } = parsed.data
  const orderTotalBRL = orderTotal / 100
  const now = new Date().toISOString()

  const { data: coupon, error } = await supabaseAdmin
    .from('coupons')
    .select('id, code, type, value, min_order_value, max_uses, used_count, valid_from, valid_until, active')
    .eq('code', code.toUpperCase().trim())
    .single()

  if (error || !coupon) {
    return NextResponse.json({ valid: false, error: 'Cupom não encontrado' })
  }

  if (!coupon.active) {
    return NextResponse.json({ valid: false, error: 'Cupom inativo' })
  }

  if (coupon.valid_from && now < (coupon.valid_from as string)) {
    return NextResponse.json({ valid: false, error: 'Cupom ainda não está válido' })
  }

  if (coupon.valid_until && now > (coupon.valid_until as string)) {
    return NextResponse.json({ valid: false, error: 'Cupom expirado' })
  }

  if (coupon.max_uses !== null && (coupon.used_count as number) >= (coupon.max_uses as number)) {
    return NextResponse.json({ valid: false, error: 'Cupom esgotado' })
  }

  if (orderTotalBRL < (coupon.min_order_value as number)) {
    const minFormatted = (coupon.min_order_value as number)
      .toFixed(2)
      .replace('.', ',')
    return NextResponse.json({
      valid: false,
      error: `Pedido mínimo de R$ ${minFormatted} para este cupom`,
    })
  }

  // Calcular desconto em centavos
  let discountCents: number
  if (coupon.type === 'percentage') {
    discountCents = Math.round(orderTotal * ((coupon.value as number) / 100))
  } else {
    discountCents = Math.min(Math.round((coupon.value as number) * 100), orderTotal)
  }

  return NextResponse.json({
    valid: true,
    discount: discountCents,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
    },
  })
}
