import { NextRequest, NextResponse } from 'next/server'

// GET /r/[code] — grava cookie de indicação e redireciona para a home
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  const { code } = params
  const response = NextResponse.redirect(new URL('/', req.url))
  response.cookies.set('referral_code', code.toUpperCase(), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: '/',
  })
  return response
}
