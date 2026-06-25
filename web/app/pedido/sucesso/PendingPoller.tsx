'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Componente headless que faz router.refresh() a cada 5 s enquanto montado.
 * Usado na página de sucesso quando o pedido ainda está "pending" (ex: Pix).
 * O refresh re-executa o Server Component, re-verificando o status no banco.
 */
export function PendingPoller() {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(id)
  }, [router])

  return null
}
