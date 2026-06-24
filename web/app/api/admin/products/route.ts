import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const productSchema = z.object({
  title: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  slug: z.string().optional(),
  description: z.string().min(10, 'Descrição deve ter ao menos 10 caracteres'),
  pedagogical_objectives: z.string().optional(),
  /** Preço em centavos, ex: 990 = R$ 9,90 */
  price: z
    .number({ invalid_type_error: 'Preço inválido' })
    .int('Preço deve ser um número inteiro (centavos)')
    .min(100, 'Preço mínimo: R$ 1,00'),
  grade_level: z.enum(
    ['1ano', '2ano', '3ano', '4ano', '5ano', '6ano', '7ano', '8ano', '9ano'],
    { errorMap: () => ({ message: 'Série escolar inválida' }) },
  ),
  discipline: z.enum(
    ['matematica', 'portugues', 'ciencias', 'historia', 'geografia', 'artes', 'educacao-fisica', 'ingles'],
    { errorMap: () => ({ message: 'Disciplina inválida' }) },
  ),
  full_pdf_path: z.string().min(1, 'Caminho do PDF é obrigatório'),
  thumbnail_url: z.string().optional().default(''),
  preview_url: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
})

// ─── POST /api/admin/products ──────────────────────────────────────────────

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

  const parsed = productSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const data = parsed.data
  const slug = data.slug?.trim() || toSlug(data.title)

  // Verificar slug único
  const { data: existing } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('slug', slug)
    .single()

  const finalSlug = existing ? `${slug}-${Date.now()}` : slug

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .insert({
      title: data.title,
      slug: finalSlug,
      description: data.description,
      pedagogical_objectives: data.pedagogical_objectives ?? null,
      price: data.price,
      grade_level: data.grade_level,
      discipline: data.discipline,
      full_pdf_path: data.full_pdf_path,
      thumbnail_url: data.thumbnail_url,
      preview_url: data.preview_url,
      tags: data.tags,
      active: false, // inativo até o admin publicar
    })
    .select()
    .single()

  if (error) {
    console.error('[products] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ product }, { status: 201 })
}

// ─── GET /api/admin/products ───────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = 20
  const offset = (page - 1) * limit

  const { data, error, count } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ products: data, total: count, page, limit })
}
