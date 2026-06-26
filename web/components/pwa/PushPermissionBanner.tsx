'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { toast } from 'sonner'

const DISMISSED_KEY = 'push-dismissed'

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const uint8 = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; i++) {
    uint8[i] = rawData.charCodeAt(i)
  }
  return buffer
}

export default function PushPermissionBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      !('serviceWorker' in navigator)
    ) return

    if (
      Notification.permission !== 'default' ||
      localStorage.getItem(DISMISSED_KEY)
    ) return

    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  async function handleAllow() {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setVisible(false)
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) throw new Error('VAPID key não configurada')

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(vapidKey),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      })

      toast.success('Notificações ativadas!')
    } catch (err) {
      console.error('[PushBanner] Erro ao subscrever:', err)
      toast.error('Não foi possível ativar as notificações.')
    } finally {
      setVisible(false)
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-sm rounded-xl border border-gray-200 bg-white p-4 shadow-lg lg:bottom-6 lg:left-auto lg:right-6 lg:max-w-xs">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
          <Bell className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Ativar notificações?</p>
          <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
            Receba avisos quando seu pedido for aprovado.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAllow}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Ativar notificações
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-full p-0.5 text-gray-400 hover:text-gray-600"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
