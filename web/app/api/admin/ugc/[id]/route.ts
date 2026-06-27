import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

type Params = { params: { id: string } }

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  const { data } = await supabaseAdmin
    .from('admins')
    .select('email')
    .eq('email', session.user.email)
    .maybeSingle()
  return data ? session : null
}

// PATCH /api/admin/ugc/[id] — aprovar ou rejeitar foto
// Body: { approved: boolean }
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (typeof body?.approved !== 'boolean') {
    return NextResponse.json({ error: 'approved (boolean) é obrigatório' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('ugc_photos')
    .update({ approved: body.approved })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/ugc/[id] — deletar foto permanentemente
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  // Busca storage_path antes de deletar
  const { data: photo } = await supabaseAdmin
    .from('ugc_photos')
    .select('storage_path')
    .eq('id', params.id)
    .single()

  if (photo?.storage_path) {
    await supabaseAdmin.storage.from('ugc').remove([photo.storage_path])
  }

  const { error } = await supabaseAdmin
    .from('ugc_photos')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
