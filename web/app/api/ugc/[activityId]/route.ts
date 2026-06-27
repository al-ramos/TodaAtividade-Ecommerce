import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type Params = { params: { activityId: string } }

// GET /api/ugc/[activityId] — fotos aprovadas de uma atividade
export async function GET(_req: NextRequest, { params }: Params) {
  const { activityId } = params

  const { data, error } = await supabaseAdmin
    .from('ugc_photos')
    .select('id, storage_path, caption, created_at')
    .eq('activity_id', activityId)
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar fotos' }, { status: 500 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const photos = (data ?? []).map((p) => ({
    ...p,
    url: `${supabaseUrl}/storage/v1/object/public/ugc/${p.storage_path}`,
  }))

  return NextResponse.json({ photos })
}
