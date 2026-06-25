import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/favoritos/[productId] — retorna { isFavorite: boolean }
export async function GET(
  _req: Request,
  { params }: { params: { productId: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ isFavorite: false })
  }

  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('product_id', params.productId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ isFavorite: false })
  }

  return NextResponse.json({ isFavorite: !!data })
}
