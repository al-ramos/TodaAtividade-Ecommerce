import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('per_page') || '12')
  const autocomplete = searchParams.get('autocomplete') === 'true'

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], total: 0 })
  }

  const supabase = createSupabaseServerClient()
  const offset = (page - 1) * perPage
  const limit = autocomplete ? 5 : perPage

  const { data, error, count } = await supabase
    .from('products')
    .select('id, title, slug, price, thumbnail_url', { count: 'exact' })
    .eq('active', true)
    .textSearch('search_vector', q, { type: 'websearch', config: 'portuguese' })
    .order('title')
    .range(offset, offset + limit - 1)

  if (error) {
    // Fallback to ilike if FTS fails
    const { data: fallback, count: fallbackCount } = await supabase
      .from('products')
      .select('id, title, slug, price, thumbnail_url', { count: 'exact' })
      .eq('active', true)
      .ilike('title', `%${q}%`)
      .order('title')
      .range(offset, offset + limit - 1)

    return NextResponse.json({ results: fallback || [], total: fallbackCount || 0 })
  }

  return NextResponse.json({ results: data || [], total: count || 0 })
}
