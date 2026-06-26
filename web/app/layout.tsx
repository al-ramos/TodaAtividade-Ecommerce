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
// @ts-ignore -- instalar com: npm install @vercel/analytics
import { Analytics } from '@vercel/analytics/next'
// @ts-ignore -- instalar com: npm install @vercel/speed-insights
import { SpeedInsights } from '@vercel/speed-insights/next'
import MetaPixel from '@/components/analytics/MetaPixel'
import InstallBanner from '@/components/pwa/InstallBanner'
import BottomNav from '@/components/pwa/BottomNav'
import PushPermissionBanner from '@/components/pwa/PushPermissionBanner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const BASE_URL = 'https://www.todaatividade.com.br'

export const metadata: Metadata = {
  title: {
    default: 'TodaAtividade',
    template: '%s | TodaAtividade',
  },
  description: 'Atividades pedagogicas em PDF para ensino fundamental.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? BASE_URL),
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TodaAtividade',
  },
  formatDetection: { telephone: false },
  icons: {
    apple: '/icons/icon-192.png',
    icon: '/icons/icon-192.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#2563eb',
    'msapplication-tap-highlight': 'no',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 antialiased pb-16 lg:pb-0">
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
        <MetaPixel />
        <Analytics />
        <SpeedInsights />
        <BottomNav />
        <InstallBanner />
        <PushPermissionBanner />
      </body>
    </html>
  )
}
