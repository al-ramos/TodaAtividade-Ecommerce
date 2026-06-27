import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import webpush from 'web-push'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

function isAuthorized(req: NextRequest, role?: string): boolean {
  const secret = process.env.INTERNAL_SECRET
  if (secret && req.headers.get('x-internal-secret') === secret) return true
  return role === 'admin'
}

export async function POST(req: NextRequest) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:suporte@todaatividade.com.br',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )

  const session = await getServerSession(authOptions)
  const userRole = (session?.user as { role?: string } | null)?.role

  if (!isAuthorized(req, userRole)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  let body: { userId?: string; title: string; body: string; url?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { userId, title, body: msgBody, url } = body
  if (!title || !msgBody) {
    return NextResponse.json({ error: 'title e body são obrigatórios' }, { status: 400 })
  }

  let query = supabaseAdmin.from('push_subscriptions').select('endpoint, p256dh, auth, id')
  if (userId) {
    query = query.eq('user_id', userId)
  }
  const { data: subs, error: subsError } = await query

  if (subsError) {
    console.error('[push/send] Erro ao buscar subscriptions:', subsError)
    return NextResponse.json({ error: 'Erro ao buscar subscriptions' }, { status: 500 })
  }

  const payload = JSON.stringify({
    title,
    body: msgBody,
    url: url ?? '/',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
  })

  let sent = 0
  const expiredIds: string[] = []

  await Promise.allSettled(
    (subs ?? []).map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
        sent++
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode
        if (statusCode === 410) {
          expiredIds.push(sub.id as string)
        } else {
          console.error('[push/send] Erro ao enviar para endpoint %s:', sub.endpoint, err)
        }
      }
    }),
  )

  if (expiredIds.length > 0) {
    await supabaseAdmin.from('push_subscriptions').delete().in('id', expiredIds)
  }

  return NextResponse.json({ ok: true, sent }, { status: 200 })
}
