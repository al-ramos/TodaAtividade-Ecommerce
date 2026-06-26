'use client'

import { Download, Sparkles } from 'lucide-react'

interface Props {
  productId: string
}

export default function SubscriberDownloadButton({ productId }: Props) {
  function handleDownload() {
    window.location.href = `/api/subscription/download/${productId}`
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-white hover:bg-yellow-600 transition-colors"
    >
      <Sparkles className="h-4 w-4" />
      Download (Assinante)
      <Download className="h-4 w-4" />
    </button>
  )
}
