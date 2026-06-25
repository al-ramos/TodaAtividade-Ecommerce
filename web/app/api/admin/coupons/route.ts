import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const createSchema = z.object({
  code: z.string().min(1).transform((v) => v.toUpperCase().trim()),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive(),
  min_order_value: z.number().min(0).optional().default(0),
  max_uses: z.number().int().positive().nullable().optional(),
  valid_from: z.string().datetime().optional(),
  valid_until: z.string().datetime().nullable().optional(),
})

const patchSchema = z.object({
  id: z.string().uuid(),
  active: z.boolean(),
})

// ─── GET /api/admin/coupons ───────────────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ coupons: data })
}

// ─── POST /api/admin/coupons ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { data: coupon, error } = await supabaseAdmin
    .from('coupons')
    .insert({
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      min_order_value: parsed.data.min_order_value,
      max_uses: parsed.data.max_uses ?? null,
      valid_from: parsed.data.valid_from ?? new Date().toISOString(),
      valid_until: parsed.data.valid_until ?? null,
    })
    .select()
    .single()

  if (error) {
    const msg = error.code === '23505' ? 'Código de cupom já existe' : error.message
    return NextResponse.json({ error: msg }, { status: error.code === '23505' ? 409 : 500 })
  }

  return NextResponse.json({ coupon }, { status: 201 })
}

// ─── PATCH /api/admin/coupons — toggle active ─────────────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { data: coupon, error } = await supabaseAdmin
    .from('coupons')
    .update({ active: parsed.data.active })
    .eq('id', parsed.data.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ coupon })
}
