import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

async function isAdmin(email: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('admins')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  return !!data
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar assinaturas' }, { status: 500 })
  }

  // Enriquece com e-mail via auth.admin
  const enriched = await Promise.all(
    (data ?? []).map(async (s) => {
      try {
        const { data: u } = await supabaseAdmin.auth.admin.getUserById(s.user_id)
        return { ...s, email: u?.user?.email ?? null }
      } catch {
        return { ...s, email: null }
      }
    }),
  )

  return NextResponse.json({ subscriptions: enriched })
}
