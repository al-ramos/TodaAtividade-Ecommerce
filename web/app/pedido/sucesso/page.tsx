'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Download, BookOpen } from 'lucide-react'
import Link from 'next/link'

function SucessoContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
      <div className="max-w-md mx-auto px-4 w-full">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center space-y-6">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compra aprovada!</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Obrigado pela compra! Suas atividades pedagógicas já estão disponíveis para download.
            </p>
          </div>

          {orderId && (
            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg py-2 px-3 font-mono">
              Pedido: {orderId}
            </p>
          )}

          <div className="space-y-3">
            <Link
              href="/pedidos"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar minhas atividades
            </Link>
            <Link
              href="/atividades"
              className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Ver mais atividades
            </Link>
          </div>

          <p className="text-xs text-gray-400">
            Um e-mail de confirmação será enviado para o endereço cadastrado.
          </p>
        </div>
      </div>
    </main>
  )
}

export default function SucessoPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-400 text-sm animate-pulse">Carregando...</div>
        </main>
      }
    >
      <SucessoContent />
    </Suspense>
  )
}
