'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2, CheckCircle } from 'lucide-react'

interface UgcUploadButtonProps {
  activityId: string
  hasPurchased: boolean
  onSuccess?: () => void
}

type Status = 'idle' | 'uploading' | 'success' | 'error'

export default function UgcUploadButton({ activityId, hasPurchased, onSuccess }: UgcUploadButtonProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [caption, setCaption] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!hasPurchased) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) return

    setStatus('uploading')
    setMessage('')

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('activityId', activityId)
    if (caption.trim()) formData.append('caption', caption.trim())

    try {
      const res = await fetch('/api/ugc/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(json.message ?? 'Foto enviada com sucesso!')
        setCaption('')
        setSelectedFile(null)
        setShowForm(false)
        onSuccess?.()
      } else {
        setStatus('error')
        setMessage(json.error ?? 'Erro ao enviar foto.')
      }
    } catch {
      setStatus('error')
      setMessage('Erro de conexão. Tente novamente.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        <CheckCircle className="h-4 w-4 shrink-0" />
        {message}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Camera className="h-4 w-4 text-blue-600" />
          Compartilhar foto de uso em sala de aula
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-900">Enviar foto de uso</p>
          <p className="text-xs text-gray-500">
            Sua foto será exibida após aprovação. Máx 5 MB — JPEG, PNG ou WebP.
          </p>

          <div
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {selectedFile ? (
              <p className="text-sm font-medium text-green-700">✓ {selectedFile.name}</p>
            ) : (
              <>
                <Camera className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Clique para selecionar a foto</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Legenda opcional (ex: Turma do 3º ano usando a atividade)"
            maxLength={200}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {status === 'error' && (
            <p className="text-xs text-red-600">{message}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!selectedFile || status === 'uploading'}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {status === 'uploading' ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
              ) : (
                'Enviar foto'
              )}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setSelectedFile(null); setCaption('') }}
              className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
