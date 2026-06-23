import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Rota admin: apenas usuários autenticados (adicionar role check futuramente)
    if (pathname.startsWith('/admin') && !token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Rotas protegidas que exigem login
        const protectedRoutes = ['/pedidos', '/checkout', '/admin']
        const isProtected = protectedRoutes.some(r => pathname.startsWith(r))
        if (isProtected) return !!token
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/pedidos/:path*', '/checkout/:path*', '/admin/:path*'],
}
