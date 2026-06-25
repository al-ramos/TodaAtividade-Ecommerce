'use client'

import { useState } from 'react'
import { Eye, X } from 'lucide-react'

interface Props {
  productId: string
  productTitle: string
}

export default function PDFPreviewButton({ productId, productTitle }: Props) {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  function handleOpen() {
    setLoaded(false)
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    setLoaded(false)
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Eye className="h-4 w-4" />
        Ver prévia gratuita
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={handleClose}
        >
          <div
            className="relative flex w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900 truncate pr-4">
                Prévia — {productTitle}
              </h2>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Fechar prévia"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* iframe */}
            <div className="relative">
              {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-b-2xl">
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    <span className="text-sm">Carregando prévia...</span>
                  </div>
                </div>
              )}
              <iframe
                src={`/api/preview/${productId}`}
                title={`Prévia: ${productTitle}`}
                className="w-full rounded-b-2xl"
                style={{ height: 'clamp(400px, 60vh, 640px)' }}
                onLoad={() => setLoaded(true)}
              />
            </div>

            <p className="px-5 py-3 text-center text-xs text-gray-400 border-t border-gray-100">
              Prévia gratuita das 3 primeiras páginas
            </p>
          </div>
        </div>
      )}
    </>
  )
}
