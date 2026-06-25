'use client'

import StarRating from './StarRating'

export interface ReviewData {
  id: string
  user_id: string
  maskedName: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

interface ReviewCardProps {
  review: ReviewData
  currentUserId?: string
  onEdit?: () => void
  onDelete?: () => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function Initials({ name }: { name: string }) {
  const parts = name.replace(/\./g, '').trim().split(' ').filter(Boolean)
  const letters = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-orange-100 text-orange-700',
    'bg-pink-100 text-pink-700',
  ]
  const colorClass = colors[(letters.charCodeAt(0) ?? 0) % colors.length]

  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold shrink-0 ${colorClass}`}
    >
      {letters || '?'}
    </div>
  )
}

export default function ReviewCard({
  review,
  currentUserId,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const isOwn = currentUserId === review.user_id

  return (
    <div className="flex gap-3 rounded-xl border border-gray-100 bg-white p-4">
      <Initials name={review.maskedName} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">{review.maskedName}</span>
            <StarRating value={review.rating} readonly size="sm" />
          </div>
          <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
        </div>
        {review.comment && (
          <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
        )}
        {isOwn && (
          <div className="mt-2 flex gap-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-xs text-blue-600 hover:underline"
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-xs text-red-500 hover:underline"
              >
                Excluir
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
