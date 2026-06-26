import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://todaatividade.com.br'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function buildWelcomeHtml(name?: string): string {
  const greeting = name ? `Olá, ${name}!` : 'Olá!'
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Bem-vindo(a) à newsletter</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#1d4ed8;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">TodaAtividade</h1>
            <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px;">Atividades pedagógicas prontas para imprimir</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">🎉 ${greeting}</h2>
            <p style="margin:0 0 16px;color:#374151;line-height:1.6;">
              Você receberá novidades, atividades gratuitas e dicas pedagógicas diretamente aqui.
            </p>
            <p style="margin:0 0 32px;color:#374151;line-height:1.6;">
              Fique de olho: toda semana temos novidades fresquinhas para facilitar a sua vida na sala de aula.
            </p>
            <div style="text-align:center;">
              <a href="${APP_URL}/atividades" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
                Ver atividades disponíveis
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f3f4f6;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#6b7280;font-size:12px;">
              Você recebe este e-mail porque se inscreveu em <a href="${APP_URL}" style="color:#1d4ed8;">${APP_URL.replace('https://', '')}</a>.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  let body: { email?: string; name?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 })
  }

  const { email, name } = body

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
  }

  try {
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert({ email: email.toLowerCase().trim(), name: name?.trim() || null })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Você já está inscrito!' }, { status: 200 })
      }
      console.error('[newsletter/subscribe] DB error:', error)
      return NextResponse.json({ error: 'Erro ao salvar inscrição.' }, { status: 500 })
    }
  } catch (err) {
    console.error('[newsletter/subscribe] unexpected error:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }

  // Send welcome email — failure is non-fatal
  try {
    await resend.emails.send({
      from: 'TodaAtividade <noreply@todaatividade.com.br>',
      to: email,
      subject: 'Bem-vindo(a) à newsletter da TodaAtividade! 🎉',
      html: buildWelcomeHtml(name),
    })
  } catch (err) {
    console.error('[newsletter/subscribe] Resend error:', err)
  }

  return NextResponse.json({ message: 'Inscrição realizada com sucesso!' }, { status: 201 })
}
