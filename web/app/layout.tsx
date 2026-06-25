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

const BASE_URL = 'https://www.todaatividade.com.br'

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? BASE_URL),
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: BASE_URL,
    siteName: 'TodaAtividade',
    title: 'TodaAtividade — Atividades escolares para imprimir',
    description: 'Atividades pedagógicas em PDF para ensino fundamental, do 1º ao 9º ano.',
    images: [
      {
        url: `${BASE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'TodaAtividade — Atividades escolares para imprimir',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TodaAtividade — Atividades escolares para imprimir',
    description: 'Atividades pedagógicas em PDF para ensino fundamental, do 1º ao 9º ano.',
    images: [`${BASE_URL}/og-default.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  // Google Search Console: adicione o código de verificação abaixo ao verificar o domínio
  // verification: { google: 'SEU_CODIGO_AQUI' },
}

export default async function RootLayout({ childr