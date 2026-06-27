import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/ugc — lista todas as fotos (admin only)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { data: adminRow } = await supabaseAdmin
    .from('admins')
    .select('email')
    .eq('email', session.user.email)
    .maybeSingle()

  if (!adminRow) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from('ugc_photos')
    .select('id, user_id, activity_id, storage_path, caption, approved, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const photos = (data ?? []).map((p) => ({
    ...p,
    url: `${supabaseUrl}/storage/v1/object/public/ugc/${p.storage_path}`,
  }))

  return NextResponse.json({ photos })
}
