import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const patchSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().min(10).max(300).optional(),
  content: z.string().min(1).optional(),
  cover_image_url: z.string().nullable().optional(),
  author_name: z.string().optional(),
  publish: z.boolean().optional(),
})

// ─── DELETE /api/admin/articles/[id] ──────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { error } = await supabaseAdmin
    .from('articles')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}

// ─── PATCH /api/admin/articles/[id] ───────────────────────────────────────────

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

  const { publish, ...rest } = parsed.data
  const updates: Record<string, unknown> = { ...rest, updated_at: new Date().toISOString() }
  if (publish !== undefined) {
    updates.published_at = publish ? new Date().toISOString() : null
  }

  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('articles')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    console.error('[articles/patch] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ article: data })
}
