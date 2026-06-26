import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// POST /api/ugc/upload
// Body: FormData { file: File, activityId: string, caption?: string }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const formData = await req.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: 'FormData inválido' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const activityId = formData.get('activityId') as string | null
  const caption = (formData.get('caption') as string | null)?.trim() ?? null

  if (!file || !activityId) {
    return NextResponse.json({ error: 'file e activityId são obrigatórios' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo não suportado. Use JPEG, PNG ou WebP.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Arquivo muito grande (máx 5 MB)' }, { status: 400 })
  }

  // Verifica se comprou a atividade
  const { data: orderItem } = await supabaseAdmin
    .from('order_items')
    .select('order_id, orders!inner(status)')
    .eq('product_id', activityId)
    .eq('orders.user_id', session.user.id)
    .eq('orders.status', 'paid')
    .limit(1)
    .maybeSingle()

  if (!orderItem) {
    return NextResponse.json(
      { error: 'Você só pode enviar fotos de atividades que comprou.' },
      { status: 403 },
    )
  }

  // Upload para Supabase Storage bucket "ugc"
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${session.user.id}/${activityId}/${Date.now()}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabaseAdmin.storage
    .from('ugc')
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: 'Erro ao fazer upload: ' + uploadError.message }, { status: 500 })
  }

  // Cria registro na tabela (pending approval)
  const { data: photo, error: dbError } = await supabaseAdmin
    .from('ugc_photos')
    .insert({
      user_id: session.user.id,
      activity_id: activityId,
      storage_path: path,
      caption,
      approved: false,
    })
    .select('id')
    .single()

  if (dbError) {
    // Rollback storage
    await supabaseAdmin.storage.from('ugc').remove([path])
    return NextResponse.json({ error: 'Erro ao salvar foto' }, { status: 500 })
  }

  return NextResponse.json(
    { ok: true, photoId: photo.id, message: 'Foto enviada! Ficará visível após aprovação.' },
    { status: 201 },
  )
}
