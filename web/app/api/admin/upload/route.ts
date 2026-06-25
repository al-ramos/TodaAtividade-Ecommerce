import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = 'todaatividade-pdfs'
const MAX_SIZE = 50 * 1024 * 1024 // 50 MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const slug = ((formData.get('slug') as string) || 'atividade')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (!file) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Apenas arquivos PDF são aceitos' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Arquivo maior que 50 MB' }, { status: 400 })
  }

  const id = crypto.randomUUID()
  const pdfKey = `pdfs/${id}/${slug}.pdf`
  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: pdfKey,
        Body: buffer,
        ContentType: 'application/pdf',
        ContentLength: buffer.length,
      }),
    )
  } catch (err) {
    console.error('[upload] R2 error:', err)
    return NextResponse.json({ error: 'Falha ao enviar arquivo para o storage' }, { status: 500 })
  }

  return NextResponse.json({ id, key: pdfKey }, { status: 201 })
}
