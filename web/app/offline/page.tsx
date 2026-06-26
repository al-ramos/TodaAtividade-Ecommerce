import Link from 'next/link'
import type { Metadata } from 'next'
import RetryButton from './_components/RetryButton'

export const metadata: Metadata = {
  title: 'Sem conexao | TodaAtividade',
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl">📶</div>
      <h1 className="mb-3 text-2xl font-bold text-gray-900">Sem conexao com a internet</h1>
      <p className="mb-8 max-w-sm text-gray-500">
        Nao foi possivel carregar esta pagina. Verifique sua conexao e tente novamente.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <RetryButton />
        <Link
          href="/"
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          Ir para o inicio
        </Link>
      </div>
    </div>
  )
}
