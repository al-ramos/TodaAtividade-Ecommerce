'use client'

import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'

interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
}

export default function AdminAvaliacoesPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/reviews')
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .finally(() => setLoading(false))
  }, [])

  const deleteReview = async (id: string) => {
    if (!confirm('Deletar esta avaliação?')) return
    const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Avaliações</h1>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500">
                <th className="px-4 py-3">Produto ID</th>
                <th className="px-4 py-3">Nota</th>
                <th className="px-4 py-3">Comentário</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {r.product_id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-amber-500">{'★'.repeat(r.rating)}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-gray-700">
                    {r.comment ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(r.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteReview(r.id)}
                      className="rounded p-1 text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Deletar avaliação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {reviews.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">Nenhuma avaliação cadastrada.</p>
          )}
        </div>
      )}
    </div>
  )
}
