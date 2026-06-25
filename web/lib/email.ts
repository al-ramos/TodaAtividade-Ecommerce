import { Resend } from 'resend'
import {
  buildOrderConfirmationHtml,
  type OrderConfirmationItem,
} from '@/lib/email-templates/order-confirmation'

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder')

// ─── Types ────────────────────────────────────────────────────────────────────
export interface EmailOrderItem {
  title: string
  price_at_purchase: number // centavos
  download_url: string
  image_url?: string
}

export interface SendOrderConfirmationParams {
  to: string
  customerName: string
  orderId: string
  items: EmailOrderItem[]
  totalCents: number
  paymentMethod?: 'pix' | 'credit_card'
}

// ─── sendOrderConfirmation ────────────────────────────────────────────────────
export async function sendOrderConfirmation({
  to,
  customerName,
  orderId,
  items,
  totalCents,
  paymentMethod = 'pix',
}: SendOrderConfirmationParams) {
  const orderShort = orderId.slice(0, 8).toUpperCase()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://todaatividade.com.br'

  const templateItems: OrderConfirmationItem[] = items.map((item) => ({
    name: item.title,
    imageUrl: item.image_url,
    downloadUrl: item.download_url,
  }))

  const html = buildOrderConfirmationHtml({
    customerName,
    orderId,
    items: templateItems,
    totalAmount: totalCents,
    paymentMethod,
    appUrl,
  })

  return resend.emails.send({
    from: 'TodaAtividade <noreply@todaatividade.com.br>',
    to,
    subject: `✅ Compra confirmada — pedido #${orderShort}`,
    html,
  })
}
