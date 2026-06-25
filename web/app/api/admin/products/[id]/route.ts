import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// ─── Schema de atualização parcial ────────────────────────────────────────────

const patchSchema = z.object({
  title:                   z.string().min(3, 'Título deve ter ao menos 3 caracteres').optional(),
  description:             z.string().min(10, 'Descrição deve ter ao menos 10 caracteres').optional(),
  pedagogical_objectives:  z.string().nullable().optional(),
  price: z
    .number({ invalid_type_error: 'Preço inválido' })
    .int('Preço deve ser inteiro (centavos)')
    .min(100, 'Preço mínimo: R$ 1,00')
    .optional(),
  grade_level: z
    .enum(['1ano','2ano','3ano','4ano','5ano','6ano','7ano','8ano','9ano'])
    .optional(),
  discipline: z
    .enum(['matematica','portugues','ciencias','historia','geografia','artes','educacao-fisica','ingles'])
    .optional(),
  thumbnail_url: z.string().optional(),
  full_pdf_path: z.string().optional(),
  active:        z.boolean().optional(),
})

// ─── GET /api/admin/products/[id] ─────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ product: data })
}

// ─── PATCH /api/admin/products/[id] ───────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
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

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(parsed.data)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    console.error('[products/patch] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ product: data })
}
