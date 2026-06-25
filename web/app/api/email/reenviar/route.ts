import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { sendOrderConfirmation, type EmailOrderItem } from '@/lib/email'

// ─── R2 client ────────────────────────────────────────────────────────────────
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? 'todaatividade-pdfs'
const SIGNED_URL_TTL = 3600 // 1 hora

// ─── Admin check ──────────────────────────────────────────────────────────────
function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase())
  return adminEmails.includes(email.toLowerCase())
}

// ─── POST /api/email/reenviar ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Autenticação
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // 2. Parse body
  let body: { orderId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { orderId } = body
  if (!orderId) {
    return NextResponse.json({ error: 'orderId é obrigatório' }, { status: 400 })
  }

  const userIsAdmin = isAdmin(session.user.email)

  // 3. Buscar pedido (dono ou admin)
  const query = supabaseAdmin
    .from('orders')
    .select('id, user_id, total, status')
    .eq('id', orderId)
    .eq('status', 'paid')

  if (!userIsAdmin) {
    query.eq('user_id', session.user.id)
  }

  const { data: order, error: orderError } = await query.maybeSingle()

  if (orderError) {
    console.error('[email/reenviar] Erro ao buscar pedido %s:', orderId, orderError)
    return NextResponse.json({ error: 'Erro ao buscar pedido' }, { status: 500 })
  }

  if (!order) {
    return NextResponse.json({ error: 'Pedido não encontrado ou não pago' }, { status: 404 })
  }

  // 4. Buscar itens com pdf_key e thumbnail
  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('price_at_purchase, products!product_id(id, title, pdf_key, thumbnail_url)')
    .eq('order_id', orderId)

  if (itemsError) {
    console.error('[email/reenviar] Erro ao buscar itens do pedido %s:', orderId, itemsError)
    return NextResponse.json({ error: 'Erro ao buscar itens do pedido' }, { status: 500 })
  }

  // 5. Gerar signed URLs R2 (1h) para cada PDF
  const emailItems: EmailOrderItem[] = await Promise.all(
    (items ?? []).map(async (item) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products
      const pdfKey = (product as { pdf_key?: string | null } | null)?.pdf_key ?? null
      const title = (product as { title?: string } | null)?.title ?? 'Atividade'
      const imageUrl =
        (product as { thumbnail_url?: string | null } | null)?.thumbnail_url ?? undefined

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://todaatividade.com.br'
      let downloadUrl = `${appUrl}/minha-conta/pedidos`

      if (pdfKey) {
        try {
          downloadUrl = await getSignedUrl(
            r2,
            new GetObjectCommand({ Bucket: BUCKET, Key: pdfKey }),
            { expiresIn: SIGNED_URL_TTL },
          )
        } catch (err) {
          console.error('[email/reenviar] Erro ao gerar signed URL para %s:', pdfKey, err)
        }
      }

      return {
        title,
        price_at_purchase: item.price_at_purchase as number,
        download_url: downloadUrl,
        image_url: imageUrl,
      }
    }),
  )

  // 6. Buscar e-mail do comprador
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
    order.user_id as string,
  )

  if (authError || !authUser?.user?.email) {
    console.error('[email/reenviar] E-mail não encontrado para user_id=%s', order.user_id, authError)
    return NextResponse.json({ error: 'E-mail do comprador não encontrado' }, { status: 500 })
  }

  const userEmail = authUser.user.email
  const userName =
    authUser.user.user_metadata?.full_name ??
    authUser.user.user_metadata?.name ??
    userEmail.split('@')[0]

  // 7. Reenviar e-mail de confirmação
  try {
    await sendOrderConfirmation({
      to: userEmail,
      customerName: userName,
      orderId: order.id as string,
      items: emailItems,
      totalCents: order.total as number,
    })
    console.info('[email/reenviar] E-mail reenviado para %s (pedido %s)', userEmail, orderId)
  } catch (err) {
    console.error('[email/reenviar] Falha ao reenviar e-mail para %s:', userEmail, err)
    return NextResponse.json({ error: 'Falha ao enviar e-mail' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
