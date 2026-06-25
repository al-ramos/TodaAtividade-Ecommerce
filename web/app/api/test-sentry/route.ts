import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

/**
 * GET /api/test-sentry
 * Rota de teste para verificar se o Sentry está capturando erros.
 * Remover em produção ou proteger com autenticação admin.
 */
export async function GET() {
  try {
    throw new Error('[Sentry Test] Erro intencional para verificar integração')
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { message: 'Erro capturado e enviado ao Sentry. Verifique o dashboard.' },
      { status: 200 },
    )
  }
}
