import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import MercadoPagoConfig, { Payment } from 'mercadopago'
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

// ─── Mercado Pago client ──────────────────────────────────────────────────────
function getMPClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  })
}

// ─── Signature verification ───────────────────────────────────────────────────
// Algoritmo: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
// Header x-signature: ts=<timestamp>,v1=<hex_hash>
// Manifest:  id:<payment_id>;request-id:<x-request-id>;ts:<ts>;
function verifyMPSignature(
  paymentId: string,
  xRequestId: string | null,
  xSignature: string | null,
): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret || !xSignature) return false

  const parts: Record<string, string> = {}
  for (const segment of xSignature.split(',')) {
    const eqIdx = segment.indexOf('=')
    if (eqIdx === -1) continue
    const k = segment.slice(0, eqIdx).trim()
    const v = segment.slice(eqIdx + 1).trim()
    if (k) parts[k] = v
  }

  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const manifest = `id:${paymentId};request-id:${xRequestId ?? ''};ts:${ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'))
  } catch {
    // Lengths differ → invalid
    return false
  }
}

// ─── POST /api/webhooks/mercadopago ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Parse body
  let body: { type?: string; data?: { id?: string | number } }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // Ignora eventos que não sejam de pagamento
  if (body.type !== 'payment' || !body.data?.id) {
    return NextResponse.json({ ok: true })
  }

  const paymentId = String(body.data.id)
  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')

  // 2. Verificar assinatura
  if (!verifyMPSignature(paymentId, xRequestId, xSignature)) {
    console.warn('[webhook/mp] Assinatura inválida para payment_id=%s', paymentId)
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  // 3. Buscar pagamento no Mercado Pago para confirmar status
  let mpPayment
  try {
    const paymentClient = new Payment(getMPClient())
    mpPayment = await paymentClient.get({ id: paymentId })
  } catch (err) {
    console.error('[webhook/mp] Erro ao buscar pagamento %s:', paymentId, err)
    return NextResponse.json({ error: 'Erro ao buscar pagamento' }, { status: 502 })
  }

  if (mpPayment.status !== 'approved') {
    // Ainda não aprovado — acknowledge sem ação
    return NextResponse.json({ ok: true, status: mpPayment.status })
  }

  const orderId = mpPayment.external_reference
  if (!orderId) {
    console.error('[webhook/mp] Sem external_reference no payment_id=%s', paymentId)
    return NextResponse.json({ error: 'Pedido não identificado' }, { status: 422 })
  }

  // 4. Atualizar pedido para 'paid' (idempotente — .neq evita duplo processamento)
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', orderId)
    .neq('status', 'paid')
    .select('id, user_id, total, coupon_id')
    .maybeSingle()

  if (orderError) {
    console.error('[webhook/mp] Erro ao atualizar pedido %s:', orderId, orderError)
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
  }

  if (!order) {
    // Pedido já estava pago (webhook duplicado) — retorna 200 para evitar retry
    console.info('[webhook/mp] Pedido %s já estava pago — webhook ignorado', orderId)
    return NextResponse.json({ ok: true })
  }

  // 5. Incrementar used_count do cupom, se houver
  if (order.coupon_id) {
    await supabaseAdmin
      .rpc('increment_coupon_used_count', { coupon_id: order.coupon_id as string })
      .then(({ error }) => {
        if (error) console.error('[webhook/mp] Falha ao incrementar cupom %s:', order.coupon_id, error)
      })
  }

  // 6. Buscar itens do pedido com pdf_key do produto
  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('price_at_purchase, products!product_id(id, title, pdf_key, thumbnail_url)')
    .eq('order_id', orderId)

  if (itemsError) {
    console.error('[webhook/mp] Erro ao buscar itens do pedido %s:', orderId, itemsError)
  }

  // 7. Gerar signed URLs temporárias (1h) para cada PDF no R2
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
          console.error('[webhook/mp] Erro ao gerar signed URL para %s:', pdfKey, err)
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

  // 8. Buscar e-mail do comprador via auth.users (service role)
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
    order.user_id as string,
  )

  if (authError || !authUser?.user?.email) {
    console.error('[webhook/mp] E-mail não encontrado para user_id=%s', order.user_id, authError)
    return NextResponse.json({ ok: true })
  }

  const userEmail = authUser.user.email
  const userName =
    authUser.user.user_metadata?.full_name ??
    authUser.user.user_metadata?.name ??
    userEmail.split('@')[0]

  // 9. Enviar e-mail de confirmação
  try {
    await sendOrderConfirmation({
      to: userEmail,
      customerName: userName,
      orderId: order.id as string,
      items: emailItems,
      totalCents: order.total as number,
    })
    console.info('[webhook/mp] E-mail enviado para %s (pedido %s)', userEmail, orderId)
  } catch (err) {
    // Não falha — pedido já foi marcado como pago
    console.error('[webhook/mp] Falha ao enviar e-mail para %s:', userEmail, err)
  }

  return NextResponse.json({ ok: true })
}
