import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('bundles')
    .select(`
      *,
      bundle_items (
        id,
        product_id
      )
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, slug, description, price, original_price, product_ids } = body

  if (!title || !slug || !price || !original_price) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  const { data: bundle, error: bundleError } = await supabaseAdmin
    .from('bundles')
    .insert({ title, slug, description: description || null, price, original_price })
    .select()
    .single()

  if (bundleError) return NextResponse.json({ error: bundleError.message }, { status: 500 })

  if (Array.isArray(product_ids) && product_ids.length > 0) {
    const items = product_ids.map((product_id: string) => ({
      bundle_id: bundle.id,
      product_id,
    }))
    const { error: itemsError } = await supabaseAdmin.from('bundle_items').insert(items)
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  return NextResponse.json(bundle, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, active } = body

  if (!id || typeof active !== 'boolean') {
    return NextResponse.json({ error: 'id e active são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('bundles')
    .update({ active })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
