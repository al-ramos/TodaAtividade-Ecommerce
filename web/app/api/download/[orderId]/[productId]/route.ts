import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

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
const DOWNLOAD_URL_TTL = 900 // 15 minutos

// ─── GET /api/download/[orderId]/[productId] ──────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string; productId: string } },
) {
  // 1. Autenticação
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { orderId, productId } = params

  // 2. Valida que o pedido pertence ao usuário autenticado
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id, user_id, status')
    .eq('id', orderId)
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 403 })
  }

  // 3. Valida que o pedido está pago
  if (order.status !== 'paid') {
    return NextResponse.json({ error: 'Pagamento não confirmado' }, { status: 403 })
  }

  // 4. Valida que o produto está nos itens do pedido e obtém o pdf_key
  const { data: item, error: itemError } = await supabaseAdmin
    .from('order_items')
    .select('product_id, products!product_id(pdf_key, title)')
    .eq('order_id', orderId)
    .eq('product_id', productId)
    .maybeSingle()

  if (itemError || !item) {
    return NextResponse.json({ error: 'Produto não encontrado no pedido' }, { status: 404 })
  }

  type ProductJoin = { pdf_key: string | null; title: string } | null
  const product = (
    Array.isArray(item.products) ? item.products[0] : item.products
  ) as ProductJoin

  const pdfKey = product?.pdf_key
  if (!pdfKey) {
    return NextResponse.json({ error: 'PDF não disponível para este produto' }, { status: 404 })
  }

  // Sanitiza o título para usar no nome do arquivo do download
  const filename = (product?.title ?? 'atividade')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase()

  // 5. Gera signed URL com TTL de 15 minutos
  let signedUrl: string
  try {
    signedUrl = await getSignedUrl(
      r2,
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: pdfKey,
        ResponseContentType: 'application/pdf',
        ResponseContentDisposition: `attachment; filename="${filename}.pdf"`,
      }),
      { expiresIn: DOWNLOAD_URL_TTL },
    )
  } catch (err) {
    console.error('[download] Erro ao gerar signed URL para %s:', pdfKey, err)
    return NextResponse.json({ error: 'Erro ao gerar link de download' }, { status: 500 })
  }

  // 6. Redirect 302 → signed URL (a URL nunca é exposta na página do cliente)
  return NextResponse.redirect(signedUrl)
}
