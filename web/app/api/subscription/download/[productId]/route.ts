import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PDFDocument, rgb, degrees } from 'pdf-lib'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserSubscriptionStatus } from '@/lib/subscription'

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

async function fetchPdfBytes(key: string): Promise<Uint8Array> {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  const { Body } = await r2.send(cmd)
  if (!Body) throw new Error('R2 Body vazio')
  const chunks: Uint8Array[] = []
  for await (const chunk of Body as AsyncIterable<Uint8Array>) chunks.push(chunk)
  const total = chunks.reduce((sum, c) => sum + c.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length }
  return result
}

async function applyWatermark(pdfBytes: Uint8Array, email: string): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize()
    const fontSize = Math.max(10, Math.min(width * 0.04, 16))
    page.drawText(email, {
      x: width / 2 - email.length * fontSize * 0.3,
      y: height / 2,
      size: fontSize,
      color: rgb(0.55, 0.55, 0.55),
      opacity: 0.18,
      rotate: degrees(35),
    })
    page.drawText(email, {
      x: 20,
      y: 20,
      size: Math.max(7, fontSize * 0.7),
      color: rgb(0.55, 0.55, 0.55),
      opacity: 0.22,
    })
  }
  return doc.save()
}

// ─── GET /api/subscription/download/[productId] ───────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { productId: string } },
) {
  // 1. Autenticação
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // 2. Valida assinatura ativa
  const sub = await getUserSubscriptionStatus(session.user.id)
  if (!sub.isActive) {
    return NextResponse.json(
      { error: 'Assinatura ativa necessária para este download' },
      { status: 403 },
    )
  }

  // 3. Busca o produto
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('pdf_key, title')
    .eq('id', params.productId)
    .eq('active', true)
    .maybeSingle()

  if (error || !product?.pdf_key) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
  }

  const buyerEmail = session.user.email ?? session.user.id
  const filename = (product.title ?? 'atividade')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase()

  // 4. Watermark + stream
  try {
    const rawBytes = await fetchPdfBytes(product.pdf_key)
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
    // Fallback: signed URL sem watermark
    console.error('[sub-download] Watermark falhou, usando fallback:', err)
    const signedUrl = await getSignedUrl(
      r2,
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: product.pdf_key,
        ResponseContentType: 'application/pdf',
        ResponseContentDisposition: `attachment; filename="${filename}.pdf"`,
      }),
      { expiresIn: 900 },
    )
    return NextResponse.redirect(signedUrl)
  }
}
