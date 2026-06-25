import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PDFDocument, rgb, degrees } from 'pdf-lib'
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
const DOWNLOAD_URL_TTL = 900 // 15 minutos (fallback)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Lê o body de um GetObjectCommand como Uint8Array */
async function fetchPdfBytes(key: string): Promise<Uint8Array> {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  const { Body } = await r2.send(cmd)
  if (!Body) throw new Error('R2 Body vazio')

  // Body é um ReadableStream no edge / Readable no Node
  const chunks: Uint8Array[] = []
  for await (const chunk of Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk)
  }
  const total = chunks.reduce((sum, c) => sum + c.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}

/** Aplica watermark diagonal com o e-mail do comprador em todas as páginas */
async function applyWatermark(pdfBytes: Uint8Array, email: string): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
  const pages = doc.getPages()

  for (const page of pages) {
    const { width, height } = page.getSize()
    const fontSize = Math.max(10, Math.min(width * 0.04, 16))
    const text = email

    // Centro da página
    const x = width / 2
    const y = height / 2

    // Linha 1 — diagonal central
    page.drawText(text, {
      x: x - (text.length * fontSize * 0.3),
      y: y,
      size: fontSize,
      color: rgb(0.55, 0.55, 0.55),
      opacity: 0.18,
      rotate: degrees(35),
    })

    // Linha 2 — canto inferior
    page.drawText(text, {
      x: 20,
      y: 20,
      size: Math.max(7, fontSize * 0.7),
      color: rgb(0.55, 0.55, 0.55),
      opacity: 0.22,
    })
  }

  return doc.save()
}

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
  const buyerEmail = session.user.email ?? session.user.id

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
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase()

  // 5. Tenta buscar o PDF e aplicar watermark em memória
  try {
    const rawBytes = await fetchPdfBytes(pdfKey)
    const watermarkedBytes = await applyWatermark(rawBytes, buyerEmail)

    return new NextResponse(Buffer.from(watermarkedBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        'Content-Length': String(watermarkedBytes.length),
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    // 6. Fallback: se pdf-lib falhar, serve via signed URL (sem watermark)
    console.error('[download] Watermark falhou para %s, usando fallback:', pdfKey, err)

    try {
      const signedUrl = await getSignedUrl(
        r2,
        new GetObjectCommand({
          Bucket: BUCKET,
          Key: pdfKey,
          ResponseContentType: 'application/pdf',
          ResponseContentDisposition: `attachment; filename="${filename}.pdf"`,
        }),
        { expiresIn: DOWNLOAD_URL_TTL },
      )
      return NextResponse.redirect(signedUrl)
    } catch (fallbackErr) {
      console.error('[download] Fallback signed URL também falhou:', fallbackErr)
      return NextResponse.json({ error: 'Erro ao gerar link de download' }, { status: 500 })
    }
  }
}
