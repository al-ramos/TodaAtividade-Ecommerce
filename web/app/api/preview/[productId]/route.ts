import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { PDFDocument, rgb, degrees } from 'pdf-lib'
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

async function fetchPdfBytes(key: string): Promise<Uint8Array> {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  const { Body } = await r2.send(cmd)
  if (!Body) throw new Error('R2 Body vazio')

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

async function buildPreview(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
  const previewDoc = await PDFDocument.create()

  const pageCount = Math.min(3, srcDoc.getPageCount())
  const indices = Array.from({ length: pageCount }, (_, i) => i)
  const copiedPages = await previewDoc.copyPages(srcDoc, indices)
  copiedPages.forEach(p => previewDoc.addPage(p))

  const watermarkText = 'PRÉVIA — TodaAtividade.com.br'
  const pages = previewDoc.getPages()

  for (const page of pages) {
    const { width, height } = page.getSize()
    const fontSize = Math.max(10, Math.min(width * 0.035, 18))
    const textWidth = watermarkText.length * fontSize * 0.5

    page.drawText(watermarkText, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.15,
      rotate: degrees(35),
    })
  }

  return previewDoc.save()
}

// ─── GET /api/preview/[productId] ─────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { productId: string } },
) {
  const { productId } = params

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('pdf_key')
    .eq('id', productId)
    .eq('active', true)
    .maybeSingle()

  if (error || !product) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
  }

  const pdfKey = (product as { pdf_key: string | null }).pdf_key
  if (!pdfKey) {
    return NextResponse.json({ error: 'PDF não disponível para este produto' }, { status: 404 })
  }

  try {
    const rawBytes = await fetchPdfBytes(pdfKey)
    const previewBytes = await buildPreview(rawBytes)

    return new NextResponse(Buffer.from(previewBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': String(previewBytes.length),
      },
    })
  } catch (err) {
    console.error('[preview] Falha ao gerar prévia para', productId, err)
    return NextResponse.json({ error: 'Falha ao gerar prévia' }, { status: 500 })
  }
}
