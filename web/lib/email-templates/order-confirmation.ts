// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderConfirmationItem {
  name: string
  imageUrl?: string
  downloadUrl: string
}

export interface BuildOrderConfirmationHtmlParams {
  customerName: string
  orderId: string
  items: OrderConfirmationItem[]
  totalAmount: number // centavos
  paymentMethod: 'pix' | 'credit_card'
  appUrl: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function paymentMethodLabel(method: 'pix' | 'credit_card'): string {
  return method === 'pix' ? 'PIX' : 'Cartão de crédito'
}

// ─── Template ─────────────────────────────────────────────────────────────────

export function buildOrderConfirmationHtml({
  customerName,
  orderId,
  items,
  totalAmount,
  paymentMethod,
  appUrl,
}: BuildOrderConfirmationHtmlParams): string {
  const orderShort = orderId.slice(0, 8).toUpperCase()
  const year = new Date().getFullYear()
  const orderDate = formatDate(new Date())
  const pedidosUrl = `${appUrl}/minha-conta/pedidos`

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 16px;border-bottom:1px solid #F3F4F6;vertical-align:middle;">
            <div style="display:flex;align-items:center;gap:12px;">
              ${
                item.imageUrl
                  ? `<img src="${item.imageUrl}" alt="${item.name}" width="48" height="48"
                       style="border-radius:6px;object-fit:cover;flex-shrink:0;border:1px solid #E5E7EB;" />`
                  : `<div style="width:48px;height:48px;border-radius:6px;background:#EDE9FE;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px;">📄</div>`
              }
              <span style="color:#374151;font-size:14px;font-weight:500;">${item.name}</span>
            </div>
          </td>
          <td style="padding:14px 16px;border-bottom:1px solid #F3F4F6;text-align:center;vertical-align:middle;">
            <a href="${item.downloadUrl}"
               style="display:inline-block;background:#7C3AED;color:#fff;padding:9px 20px;border-radius:7px;text-decoration:none;font-size:13px;font-weight:600;white-space:nowrap;">
              ⬇ Baixar PDF
            </a>
          </td>
        </tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Confirmação de Compra – TodaAtividade</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%);padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-.5px;">TodaAtividade</h1>
                    <p style="margin:4px 0 0;color:#C4B5FD;font-size:13px;">Atividades pedagógicas para professores</p>
                  </td>
                  <td align="right">
                    <div style="background:rgba(255,255,255,.15);border-radius:50%;width:52px;height:52px;display:inline-flex;align-items:center;justify-content:center;font-size:26px;">✅</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #F3F4F6;">
              <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">Compra confirmada! 🎉</h2>
              <p style="margin:0;color:#6B7280;font-size:15px;line-height:1.65;">
                Olá, <strong style="color:#374151;">${customerName}</strong>!
                Seu pagamento foi aprovado. Clique em <strong style="color:#7C3AED;">Baixar PDF</strong> para acessar cada atividade.
              </p>
            </td>
          </tr>

          <!-- Order info -->
          <tr>
            <td style="padding:20px 40px;background:#FAFAFA;border-bottom:1px solid #F3F4F6;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:33%;">
                    <p style="margin:0;color:#9CA3AF;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Pedido</p>
                    <p style="margin:4px 0 0;color:#374151;font-size:14px;font-weight:600;">#${orderShort}</p>
                  </td>
                  <td style="width:34%;text-align:center;">
                    <p style="margin:0;color:#9CA3AF;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Pagamento</p>
                    <p style="margin:4px 0 0;color:#374151;font-size:14px;font-weight:600;">${paymentMethodLabel(paymentMethod)}</p>
                  </td>
                  <td style="width:33%;text-align:right;">
                    <p style="margin:0;color:#9CA3AF;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Data</p>
                    <p style="margin:4px 0 0;color:#374151;font-size:14px;font-weight:600;">${orderDate}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0 0 14px;color:#111827;font-size:15px;font-weight:700;">Suas atividades</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
                <tbody>
                  ${itemRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding:16px 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:right;">
                    <span style="color:#6B7280;font-size:14px;">Total pago: </span>
                    <strong style="color:#111827;font-size:17px;font-weight:700;">${formatBRL(totalAmount)}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Warning -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;color:#92400E;font-size:13px;line-height:1.65;">
                      ⚠️ <strong>Links válidos por 1 hora.</strong>
                      Após esse prazo, acesse
                      <a href="${pedidosUrl}" style="color:#7C3AED;text-decoration:underline;font-weight:600;">Minhas Compras</a>
                      para gerar novos links a qualquer momento.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="${pedidosUrl}"
                 style="display:inline-block;background:#7C3AED;color:#fff;padding:13px 32px;border-radius:9px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:.01em;">
                Ver todas as minhas compras
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #E5E7EB;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 24px;">
              <p style="margin:0 0 6px;color:#9CA3AF;font-size:12px;text-align:center;line-height:1.6;">
                Dúvidas? Responda este e-mail ou acesse
                <a href="${appUrl}/contato" style="color:#7C3AED;">nosso suporte</a>.
              </p>
              <p style="margin:0;color:#D1D5DB;font-size:11px;text-align:center;">
                © ${year} TodaAtividade · Todos os direitos reservados
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
