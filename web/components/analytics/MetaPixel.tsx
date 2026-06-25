'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

type MetaPixelEvent = 'PageView' | 'InitiateCheckout' | 'Purchase' | 'AddToCart' | 'ViewContent' | 'Search' | 'CompleteRegistration'

interface PurchaseParams {
  value: number
  currency: string
  content_ids?: string[]
  num_items?: number
}

declare global {
  interface Window {
    fbq?: (type: 'track' | 'init', eventOrPixelId: string, params?: Record<string, unknown>) => void
    _fbq?: unknown
  }
}

export function trackPixelEvent(event: MetaPixelEvent, params?: PurchaseParams) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, params as unknown as Record<string, unknown>)
  }
}

export default function MetaPixel() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (PIXEL_ID) trackPixelEvent('PageView')
  }, [pathname, searchParams])

  if (!PIXEL_ID) return null

  return (
    <>
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`,
        }}
      />
      <noscript>
        <img height="1" width="1" style={{ display: 'none' }} src={"https://www.facebook.com/tr?id=" + PIXEL_ID + "&ev=PageView&noscript=1"} alt="" />
      </noscript>
    </>
  )
}
