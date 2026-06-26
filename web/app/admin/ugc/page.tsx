'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react'

interface UgcPhoto {
  id: string
  storage_path: string
  caption: string | null
  approved: boolean
  created_at: string
  activity_id: string
  user_id: string
  url: string
  productTitle?: string
}

export default function AdminUgcPage() {
  const [photos, setPhotos] = useState<UgcPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending')
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  async function fetchPhotos() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ugc')
      if (res.ok) {
        const data = await res.json()
        setPhotos(data.photos ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  async function approve(id: string) {
    setActionId(id)
    await fetch(`/api/admin/ugc/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: true }),
    })
    setPhotos((prev) => prev.map((p) => p.id === id ? { ...p, approved: true } : p))
    setActionId(null)
  }

  async function reject(id: string) {
    setActionId(id)
    await fetch(`/api/admin/ugc/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: false }),
    })
    setPhotos((prev) => prev.map((p) => p.id === id ? { ...p, approved: false } : p))
    setActionId(null)
  }

  async function remove(id: string) {
    if (!confirm('Deletar esta foto permanentemente?')) return
    setActionId(id)
    await fetch(`/api/admin/ugc/${id}`, { method: 'DELETE' })
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    setActionId(null)
  }

  const filtered = photos.filter((p) => {
    if (filter === 'pending') return !p.approved
    if (filter === 'approved') return p.approved
    return true
  })

  const pendingCount = photos.filter((p) => !p.approved).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">UGC — Fotos de sala de aula</h1>
          <p className="text-sm text-gray-500">
            {pendingCount > 0
              ? `${pendingCount} foto${pendingCount !== 1 ? 's' : ''} aguardando aprovação`
              : 'Nenhuma foto pendente'}
          </p>
        </div>
        <div className="flex gap-2">
          {(['pending', 'approved', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'pending' ? `Pendentes (${pendingCount})` : f === 'approved' ? 'Aprovadas' : 'Todas'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-500">
          Nenhuma foto encontrada
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={photo.url}
                  alt={photo.caption ?? 'Foto UGC'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {/* Status badge */}
                <div className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  photo.approved
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {photo.approved ? 'Aprovada' : 'Pendente'}
                </div>
              </div>

              <div className="p-3 space-y-2">
                {photo.caption && (
                  <p className="text-xs text-gray-600 line-clamp-2">{photo.caption}</p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(photo.created_at).toLocaleDateString('pt-BR')}
                </p>

                <div className="flex gap-1.5">
                  {!photo.approved && (
                    <button
                      onClick={() => approve(photo.id)}
                      disabled={actionId === photo.id}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-50 px-2 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      {actionId === photo.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      Aprovar
                    </button>
                  )}
                  {photo.approved && (
                    <button
                      onClick={() => reject(photo.id)}
                      disabled={actionId === photo.id}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-yellow-50 px-2 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-100 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-3 w-3" />
                      Rejeitar
                    </button>
                  )}
                  <button
                    onClick={() => remove(photo.id)}
                    disabled={actionId === photo.id}
                    className="flex items-center justify-center rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                    title="Deletar permanentemente"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
