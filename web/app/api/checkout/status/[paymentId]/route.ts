import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import MercadoPagoConfig, { Payment } from 'mercadopago'

function getMPClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  })
}

// ─── GET /api/checkout/status/[paymentId] ─────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { paymentId: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { paymentId } = params
  if (!paymentId) {
    return NextResponse.json({ error: 'paymentId obrigatório' }, { status: 400 })
  }

  try {
    const paymentClient = new Payment(getMPClient())
    const payment = await paymentClient.get({ id: paymentId })

    return NextResponse.json({
      status: payment.status,            // 'pending' | 'approved' | 'rejected' | 'cancelled'
      status_detail: payment.status_detail,
      external_reference: payment.external_reference,
      payment_id: payment.id,
    })
  } catch (err) {
    console.error('[checkout/status] MP error:', err)
    return NextResponse.json({ error: 'Erro ao consultar pagamento' }, { status: 502 })
  }
}
