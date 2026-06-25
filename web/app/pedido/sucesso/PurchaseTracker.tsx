'use client'

import { useEffect } from 'react'
import { trackPixelEvent } from '@/components/analytics/MetaPixel'

interface PurchaseTrackerProps {
  orderId: string
  total: number
  productIds: string[]
}

/**
 * Dispara o evento Purchase do Meta Pixel uma única vez por sessão,
 * quando a página de sucesso é montada.
 */
export function PurchaseTracker({ orderId, total, productIds }: PurchaseTrackerProps) {
  useEffect(() => {
    const storageKey = `pixel_purchase_${orderId}`
    if (sessionStorage.getItem(storageKey)) return

    trackPixelEvent('Purchase', {
      value: total / 100, // centavos → reais
      currency: 'BRL',
      content_ids: productIds,
      num_items: productIds.length,
    })

    sessionStorage.setItem(storageKey, '1')
  }, [orderId, total, productIds])

  return null
}
