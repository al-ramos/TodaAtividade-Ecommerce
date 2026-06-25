'use client'

import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}

const SIZES = { sm: 14, md: 18, lg: 24 }

function Star({
  filled,
  half,
  size,
  onMouseEnter,
  onClick,
}: {
  filled: boolean
  half: boolean
  size: number
  onMouseEnter?: () => void
  onClick?: () => void
}) {
  const id = `half-${size}-${Math.random().toString(36).slice(2)}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
      aria-hidden="true"
    >
      {half && (
        <defs>
          <clipPath id={id}>
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>
      )}
      {/* fundo vazio */}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="#e5e7eb"
      />
      {/* preenchimento */}
      {(filled || half) && (
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="#f59e0b"
          clipPath={half ? `url(#${id})` : undefined}
        />
      )}
    </svg>
  )
}

export default function StarRating({
  value,
  onChange,
  size = 'md',
  readonly = false,
}: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const px = SIZES[size]
  const display = readonly ? value : (hover || value)

  return (
    <div
      role={readonly ? undefined : 'radiogroup'}
      aria-label="Avaliação em estrelas"
      className="flex items-center gap-0.5"
      onMouseLeave={() => !readonly && setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = display >= star
        const half = !filled && display >= star - 0.5
        return (
          <span
            key={star}
            role={readonly ? undefined : 'radio'}
            aria-checked={readonly ? undefined : value === star}
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
          >
            <Star
              filled={filled}
              half={half}
              size={px}
              onMouseEnter={!readonly ? () => setHover(star) : undefined}
              onClick={!readonly && onChange ? () => onChange(star) : undefined}
            />
          </span>
        )
      })}
    </div>
  )
}
