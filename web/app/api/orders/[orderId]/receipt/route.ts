import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch order with items — restrict to the authenticated user's paid orders
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id, created_at, status, total_amount, discount_amount,
      coupon_id,
      order_items (
        quantity, unit_price,
        products ( title )
      )
    `)
    .eq('id', params.orderId)
    .eq('user_id', session.user.id)
    .eq('status', 'paid')
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  // Generate PDF
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const darkBlue = rgb(0.06, 0.18, 0.39)
  const gray = rgb(0.4, 0.4, 0.4)
  const lightGray = rgb(0.9, 0.9, 0.9)
  const black = rgb(0, 0, 0)
  const white = rgb(1, 1, 1)

  // Header background
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: darkBlue })

  // Company name
  page.drawText('TodaAtividade', {
    x: 40, y: height - 50, size: 22, font: fontBold, color: white,
  })
  page.drawText('www.todaatividade.com.br', {
    x: 40, y: height - 68, size: 10, font: fontReg, color: rgb(0.8, 0.8, 0.9),
  })

  // Title
  page.drawText('RECIBO DE COMPRA', {
    x: 40, y: height - 110, size: 16, font: fontBold, color: darkBlue,
  })

  // Divider
  page.drawLine({ start: { x: 40, y: height - 120 }, end: { x: width - 40, y: height - 120 }, thickness: 1, color: lightGray })

  // Order info
  const orderDate = new Date(order.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
  const shortId = order.id.split('-')[0].toUpperCase()

  let y = height - 145
  const drawRow = (label: string, value: string) => {
    page.drawText(label, { x: 40, y, size: 10, font: fontReg, color: gray })
    page.drawText(value, { x: 200, y, size: 10, font: fontReg, color: black })
    y -= 18
  }

  drawRow('Nº do Pedido:', `#${shortId}`)
  drawRow('Data:', orderDate)
  drawRow('Comprador:', session.user.name || session.user.email || '')
  drawRow('E-mail:', session.user.email || '')

  y -= 10
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: lightGray })
  y -= 20

  // Items header
  page.drawText('ITEM', { x: 40, y, size: 9, font: fontBold, color: gray })
  page.drawText('QTD', { x: 380, y, size: 9, font: fontBold, color: gray })
  page.drawText('VALOR', { x: 460, y, size: 9, font: fontBold, color: gray })
  y -= 14

  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 0.5, color: lightGray })
  y -= 14

  // Items
  const items = (order.order_items as any[]) || [] // eslint-disable-line @typescript-eslint/no-explicit-any
  for (const item of items) {
    const title = (item.products as any)?.title || 'Atividade' // eslint-disable-line @typescript-eslint/no-explicit-any
    const truncated = title.length > 55 ? title.slice(0, 52) + '...' : title
    const price = formatBRL(item.unit_price * item.quantity)

    page.drawText(truncated, { x: 40, y, size: 10, font: fontReg, color: black })
    page.drawText(String(item.quantity), { x: 390, y, size: 10, font: fontReg, color: black })
    page.drawText(price, { x: 450, y, size: 10, font: fontReg, color: black })
    y -= 18
  }

  y -= 8
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: lightGray })
  y -= 18

  // Discount
  if (order.discount_amount && order.discount_amount > 0) {
    page.drawText('Desconto (cupom):', { x: 350, y, size: 10, font: fontReg, color: gray })
    page.drawText(`- ${formatBRL(order.discount_amount)}`, { x: 450, y, size: 10, font: fontReg, color: rgb(0.8, 0.1, 0.1) })
    y -= 18
  }

  // Total
  page.drawText('TOTAL PAGO:', { x: 350, y, size: 12, font: fontBold, color: darkBlue })
  page.drawText(formatBRL(order.total_amount), { x: 450, y, size: 12, font: fontBold, color: darkBlue })
  y -= 30

  // Footer
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 0.5, color: lightGray })
  y -= 16
  page.drawText('Este documento é um comprovante de compra digital emitido por TodaAtividade.', {
    x: 40, y, size: 8, font: fontReg, color: gray,
  })
  y -= 12
  page.drawText('Em caso de dúvidas, entre em contato pelo site www.todaatividade.com.br', {
    x: 40, y, size: 8, font: fontReg, color: gray,
  })

  const pdfBytes = await pdfDoc.save()

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="recibo-${shortId}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}

function formatBRL(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`
}
