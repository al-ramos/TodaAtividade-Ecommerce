'use client'

import { useState } from 'react'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'

interface ReenviarEmailButtonProps {
  orderId: string
}

export function ReenviarEmailButton({ orderId }: ReenviarEmailButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleReenviar() {
    if (status === 'loading') return
    setStatus('loading')

    try {
      const res = await fetch('/api/email/reenviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      if (!res.ok) throw new Error('Falha ao reenviar')

      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  if (status === 'success') {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
        <CheckCircle className="h-3.5 w-3.5" />
        E-mail reenviado!
      </span>
    )
  }

  if (status === 'error') {
    return (
      <span className="text-xs font-medium text-red-500">
        Erro ao reenviar
      </span>
    )
  }

  return (
    <button
      onClick={handleReenviar}
      disabled={status === 'loading'}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
      title="Reenviar e-mail de confirmação"
    >
      {status === 'loading' ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Mail className="h-3.5 w-3.5" />
      )}
      {status === 'loading' ? 'Enviando...' : 'Reenviar e-mail'}
    </button>
  )
}
