'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AtividadeRowActionsProps {
  id: string
  slug: string
  active: boolean
}

export default function AtividadeRowActions({ id, slug, active }: AtividadeRowActionsProps) {
  const router = useRouter()
  const [toggling, setToggling] = useState(false)
  const [currentActive, setCurrentActive] = useState(active)

  const handleToggle = async () => {
    // Pede confirmação antes de desativar
    if (currentActive) {
      const ok = window.confirm(
        'Desativar esta atividade vai removê-la do catálogo público. Quem já comprou continuará com acesso ao download. Confirmar?',
      )
      if (!ok) return
    }

    setToggling(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      })

      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        toast.error(json.error ?? 'Erro ao atualizar status.')
        return
      }

      setCurrentActive((v) => !v)
      toast.success(
        currentActive ? 'Atividade desativada do catálogo.' : 'Atividade publicada no catálogo!',
      )
      router.refresh()
    } catch {
      toast.error('Falha de conexão. Tente novamente.')
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Toggle ativo/inativo — US-25 */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={toggling}
        title={currentActive ? 'Desativar' : 'Publicar'}
        className={[
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-50',
          currentActive
            ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
            : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700',
        ].join(' ')}
      >
        {toggling ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : currentActive ? (
          <Eye className="h-3 w-3" />
        ) : (
          <EyeOff className="h-3 w-3" />
        )}
        {currentActive ? 'Publicada' : 'Inativa'}
      </button>

      {/* Editar — US-24 */}
      <Link
        href={`/admin/atividades/${id}/editar`}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
      >
        <Pencil className="h-3 w-3" />
        Editar
      </Link>

      {/* Ver página pública */}
      <Link
        href={`/atividades/${slug}`}
        target="_blank"
        className="text-xs text-blue-600 hover:underline"
      >
        Ver →
      </Link>
    </div>
  )
}
