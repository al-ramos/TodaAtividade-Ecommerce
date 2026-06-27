'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Images, X } from 'lucide-react'

interface UgcPhoto {
  id: string
  url: string
  caption: string | null
  created_at: string
}

interface UgcGalleryProps {
  activityId: string
  initialPhotos?: UgcPhoto[]
}

export default function UgcGallery({ activityId, initialPhotos = [] }: UgcGalleryProps) {
  const [photos, setPhotos] = useState<UgcPhoto[]>(initialPhotos)
  const [lightbox, setLightbox] = useState<UgcPhoto | null>(null)
  const [loading, setLoading] = useState(initialPhotos.length === 0)

  useEffect(() => {
    if (initialPhotos.length > 0) return
    fetch(`/api/ugc/${activityId}`)
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activityId, initialPhotos.length])

  if (loading) return null
  if (photos.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Images className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-900">
          Em sala de aula
          <span className="ml-2 text-sm font-normal text-gray-400">({photos.length})</span>
        </h2>
      </div>
      <p className="text-sm text-gray-500">
        Fotos enviadas por professores que usaram esta atividade.
      </p>

      {/* Masonry-style grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setLightbox(photo)}
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 aspect-square hover:opacity-95 transition-opacity"
          >
            <Image
              src={photo.url}
              alt={photo.caption ?? 'Foto de uso em sala de aula'}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="line-clamp-2 text-xs text-white">{photo.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(null)}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[85vh] max-w-2xl w-full overflow-hidden rounded-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square w-full">
              <Image
                src={lightbox.url}
                alt={lightbox.caption ?? 'Foto de uso em sala de aula'}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
            {lightbox.caption && (
              <p className="p-4 text-sm text-gray-300">{lightbox.caption}</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
