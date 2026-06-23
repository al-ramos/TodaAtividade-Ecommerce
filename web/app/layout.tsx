import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/auth/SessionProvider'
import { CartProvider } from '@/lib/cart-context'
import { CartDrawer } from '@/components/cart/CartDrawer'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'TodaAtividade — Atividades escolares para imprimir',
    template: '%s | TodaAtividade',
  },
  description:
    'Atividades pedagógicas em PDF para ensino fundamental. Catálogo completo do 1º ao 9º ano. Baixe e imprima agora.',
  keywords: ['atividades escolares', 'ensino fundamental', 'PDF', 'matemática', 'português', 'imprimir'],
  authors: [{ name: 'TodaAtividade' }],
  creator: 'TodaAtividade',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://todaatividade.com.br'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://todaatividade.com.br',
    siteName: 'TodaAtividade',
    title: 'TodaAtividade — Atividades escolares para imprimir',
    description: 'Atividades pedagógicas em PDF para ensino fundamental, do 1º ao 9º ano.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <SessionProvider session={session}>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <CartDrawer />
            <Toaster richColors position="top-right" />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
