'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FavoritoButtonProps {
  productId: string
  initialIsFavorite: boolean
  size?: 'sm' | 'md'
  className?: string
}

export default function FavoritoButton({
  productId,
  initialIsFavorite,
  size = 'md',
  className,
}: FavoritoButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [loading, setLoading] = useState(false)

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user?.id) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
      return
    }

    // Optimistic update
    const next = !isFavorite
    setIsFavorite(next)
    setLoading(true)

    try {
      if (next) {
        await fetch('/api/favoritos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
      } else {
        await fetch(`/api/favoritos?productId=${productId}`, { method: 'DELETE' })
      }
    } catch {
      // Reverter em caso de erro
      setIsFavorite(!next)
    } finally {
      setLoading(false)
    }
  }

  const isSm = size === 'sm'

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className={cn(
        'flex items-center justify-center rounded-full border transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isFavorite
          ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
          : 'border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:text-red-400',
        isSm ? 'h-7 w-7' : 'h-10 w-10',
        className,
      )}
    >
      <Heart
        className={cn(isSm ? 'h-3.5 w-3.5' : 'h-5 w-5', isFavorite && 'fill-current')}
      />
    </button>
  )
}
