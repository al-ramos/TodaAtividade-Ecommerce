'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showAndroid, setShowAndroid] = useState(false)
  const [showIos, setShowIos] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.matchMedia('(display-mode: standalone)').matches) return

    if (localStorage.getItem('pwa-install-dismissed')) return

    const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent)
    const isInStandaloneMode = 'standalone' in navigator && (navigator as Navigator & { standalone: boolean }).standalone

    if (isIos && !isInStandaloneMode) {
      setShowIos(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowAndroid(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShowAndroid(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', '1')
    setShowAndroid(false)
    setShowIos(false)
  }

  if (!showAndroid && !showIos) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-3 shadow-lg sm:px-6">
      <div className="mx-auto flex max-w-screen-sm items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon.svg" alt="TodaAtividade" className="h-10 w-10 rounded-xl" />
          <div>
            <p className="text-sm font-semibold text-gray-900">TodaAtividade</p>
            {showAndroid ? (
              <p className="text-xs text-gray-500">Instale o app da TodaAtividade no seu celular!</p>
            ) : (
              <p className="text-xs text-gray-500">
                Toque em{' '}
                <span className="font-medium">Compartilhar ↑</span> e depois{' '}
                <span className="font-medium">Adicionar à Tela de Início</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {showAndroid && (
            <button
              onClick={handleInstall}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800"
            >
              Instalar
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
