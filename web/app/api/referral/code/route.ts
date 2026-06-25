import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

function generateCode(userId: string): string {
  return (
    userId.split('-')[0].toUpperCase() +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  )
}

// GET /api/referral/code — retorna (ou cria) o código de indicação do usuário
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { data } = await supabaseAdmin
    .from('user_referrals')
    .select('referral_code, credits')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (data) {
    return NextResponse.json({ code: data.referral_code, credits: data.credits })
  }

  // Gerar novo código — tenta até 5x para evitar colisão de unicidade
  for (let i = 0; i < 5; i++) {
    const code = generateCode(session.user.id)
    const { data: created, error } = await supabaseAdmin
      .from('user_referrals')
      .insert({ user_id: session.user.id, referral_code: code })
      .select('referral_code, credits')
      .single()

    if (!error && created) {
      return NextResponse.json({ code: created.referral_code, credits: 0 })
    }
    // 23505 = unique_violation; tentar novamente com código diferente
    if (error?.code !== '23505') break
  }

  return NextResponse.json({ error: 'Erro ao gerar código de indicação' }, { status: 500 })
}
