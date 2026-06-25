import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import NovaAtividadeForm from '@/components/admin/NovaAtividadeForm'

export const metadata = {
  title: 'Nova atividade — Admin | TodaAtividade',
}

export default function NovaAtividadePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/atividades"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Atividades
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">Nova atividade</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cadastrar nova atividade</h1>
        <p className="mt-1 text-sm text-gray-500">
          Faça o upload do PDF, preencha os metadados e salve como rascunho. Você pode publicar depois.
        </p>
      </div>

      <NovaAtividadeForm />
    </div>
  )
}
