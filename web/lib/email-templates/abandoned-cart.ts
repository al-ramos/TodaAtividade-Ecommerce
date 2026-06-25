import type { CartItem } from '@/lib/types'

export interface BuildAbandonedCartHtmlParams {
  name?: string
  items: CartItem[]
  cartUrl: string
}

function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

export function buildAbandonedCartHtml({
  name,
  items,
  cartUrl,
}: BuildAbandonedCartHtmlParams): string {
  const year = new Date().getFullYear()

  const itemRows = items
    .map(
      ({ product, quantity }) => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #F3F4F6;vertical-align:middle;">
            <div style="display:flex;align-items:center;gap:12px;">
              ${
                product.thumbnail_url
                  ? `<img src="${product.thumbnail_url}" alt="${product.title}" width="44" height="44"
                       style="border-radius:6px;object-fit:cover;flex-shrink:0;border:1px solid #E5E7EB;" />`
                  : `<div style="width:44px;height:44px;border-radius:6px;background:#EDE9FE;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;">📄</div>`
              }
              <div>
                <p style="margin:0;color:#374151;font-size:14px;font-weight:500;">${product.title}</p>
                ${quantity > 1 ? `<p style="margin:2px 0 0;color:#9CA3AF;font-size:12px;">Qtd: ${quantity}</p>` : ''}
              </div>
            </div>
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #F3F4F6;text-align:right;vertical-align:middle;white-space:nowrap;">
            <span style="color:#374151;font-size:14px;font-weight:600;">${formatBRL(product.price * quantity)}</span>
          </td>
        </tr>`,
    )
    .join('')

  const greeting = name ? `Olá, <strong style="color:#374151;">${name}</strong>!` : 'Olá!'

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Você esqueceu algo no carrinho – TodaAtividade</title>
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
                    <div style="background:rgba(255,255,255,.15);border-radius:50%;width:52px;height:52px;display:inline-flex;align-items:center;justify-content:center;font-size:26px;">🛒</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #F3F4F6;">
              <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">Você esqueceu algo!</h2>
              <p style="margin:0;color:#6B7280;font-size:15px;line-height:1.65;">
                ${greeting}
                Você deixou atividades no carrinho. Que tal finalizar a compra agora?
              </p>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0 0 14px;color:#111827;font-size:15px;font-weight:700;">Itens no seu carrinho</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
                <tbody>
                  ${itemRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:28px 40px;text-align:center;">
              <a href="${cartUrl}"
                 style="display:inline-block;background:#7C3AED;color:#fff;padding:14px 36px;border-radius:9px;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:.01em;">
                Finalizar compra
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
                Para cancelar notificações, finalize ou esvazie seu carrinho.
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
