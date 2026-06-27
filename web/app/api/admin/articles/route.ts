import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

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

const articleSchema = z.object({
  title: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  slug: z.string().optional(),
  excerpt: z
    .string()
    .min(10, 'Resumo deve ter ao menos 10 caracteres')
    .max(300, 'Resumo deve ter no máximo 300 caracteres'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  cover_image_url: z.string().optional().nullable(),
  author_name: z.string().optional(),
  publish: z.boolean().optional().default(false),
})

// ─── GET /api/admin/articles ───────────────────────────────────────────────────

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ articles: data })
}

// ─── POST /api/admin/articles ──────────────────────────────────────────────────

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

  const parsed = articleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const d = parsed.data
  const slug = d.slug?.trim() || toSlug(d.title)

  const { data: existing } = await supabaseAdmin
    .from('articles')
    .select('id')
    .eq('slug', slug)
    .single()

  const finalSlug = existing ? `${slug}-${Date.now()}` : slug

  const { data: article, error } = await supabaseAdmin
    .from('articles')
    .insert({
      title: d.title,
      slug: finalSlug,
      excerpt: d.excerpt,
      content: d.content,
      cover_image_url: d.cover_image_url ?? null,
      author_name: d.author_name ?? 'Equipe TodaAtividade',
      published_at: d.publish ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) {
    console.error('[articles] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ article }, { status: 201 })
}
