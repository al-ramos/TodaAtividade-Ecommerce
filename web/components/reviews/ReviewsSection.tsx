'use client'

import { useState, useCallback } from 'react'
import StarRating from './StarRating'
import ReviewCard, { type ReviewData } from './ReviewCard'
import ReviewForm from './ReviewForm'

export interface ReviewsSectionData {
  reviews: ReviewData[]
  averageRating: number
  totalCount: number
  distribution: Record<number, number>
  userReview: ReviewData | null
}

interface ReviewsSectionProps {
  productId: string
  initialData: ReviewsSectionData
  currentUserId?: string
  hasPurchased?: boolean
}

const PAGE_SIZE = 5

export default function ReviewsSection({
  productId,
  initialData,
  currentUserId,
  hasPurchased = false,
}: ReviewsSectionProps) {
  const [data, setData] = useState(initialData)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [editingReview, setEditingReview] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/avaliacoes/${productId}`)
      if (res.ok) {
        const fresh: ReviewsSectionData = await res.json()
        setData(fresh)
        setEditingReview(false)
      }
    } catch {}
  }, [productId])

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir sua avaliação?')) return
    const res = await fetch(`/api/avaliacoes/${productId}`, { method: 'DELETE' })
    if (res.ok) refresh()
  }

  const { reviews, averageRating, totalCount, distribution } = data
  const visible = reviews.slice(0, visibleCount)
  const hasMore = visibleCount < reviews.length

  // Formulário aparece se: autenticado + comprou + (sem avaliação própria OU em modo edição)
  const showForm = !!currentUserId && hasPurchased && (!data.userReview || editingReview)

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Avaliações</h2>

      {/* ── Summary ─────────────────────────────────────────────────────── */}
      {totalCount > 0 ? (
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:gap-8">
          {/* Média */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-4xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </span>
            <StarRating value={averageRating} readonly size="md" />
            <span className="text-xs text-gray-500">{totalCount} avaliação{totalCount !== 1 ? 'ões' : ''}</span>
          </div>

          {/* Barras de distribuição */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star] ?? 0
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
              return (
                <div key={star} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-8 text-right">{star}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-400">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        !showForm && (
          <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-500">
            Seja o primeiro a avaliar esta atividade!
          </div>
        )
      )}

      {/* ── Formulário ──────────────────────────────────────────────────── */}
      {showForm && (
        <ReviewForm
          productId={productId}
          initialRating={data.userReview?.rating}
          initialComment={data.userReview?.comment ?? ''}
          onSuccess={refresh}
          onCancel={editingReview ? () => setEditingReview(false) : undefined}
        />
      )}

      {/* ── Lista de avaliações ─────────────────────────────────────────── */}
      {visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onEdit={review.user_id === currentUserId ? () => setEditingReview(true) : undefined}
              onDelete={review.user_id === currentUserId ? handleDelete : undefined}
            />
          ))}

          {hasMore && (
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium
                text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Ver mais ({reviews.length - visibleCount} restante{reviews.length - visibleCount !== 1 ? 's' : ''})
            </button>
          )}
        </div>
      )}

      {/* Prompt para login */}
      {!currentUserId && totalCount === 0 && (
        <p className="text-sm text-gray-500">
          <a href="/login" className="text-blue-600 hover:underline">Faça login</a> para avaliar esta atividade.
        </p>
      )}
    </section>
  )
}
