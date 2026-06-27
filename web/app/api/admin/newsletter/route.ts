import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('id, email, name, confirmed_at, unsubscribed_at, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/newsletter] DB error:', error)
    return NextResponse.json({ error: 'Erro ao buscar inscritos.' }, { status: 500 })
  }

  return NextResponse.json(data)
}
