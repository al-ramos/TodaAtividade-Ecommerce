'use client'

import { useState } from 'react'
import StarRating from './StarRating'

interface ReviewFormProps {
  productId: string
  initialRating?: number
  initialComment?: string
  onSuccess?: () => void
  onCancel?: () => void
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function ReviewForm({
  productId,
  initialRating = 0,
  initialComment = '',
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating)
  const [comment, setComment] = useState(initialComment)
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const MAX = 500
  const remaining = MAX - comment.length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setErrorMsg('Selecione uma nota de 1 a 5 estrelas.')
      return
    }
    setState('loading')
    setErrorMsg('')

    try {
      const res = await fetch(`/api/avaliacoes/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro desconhecido')
      }

      setState('success')
      onSuccess?.()
    } catch (err: any) {
      setState('error')
      setErrorMsg(err.message ?? 'Erro ao enviar avaliação.')
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
        ✅ Avaliação enviada com sucesso! Obrigado pelo feedback.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-900">
        {initialRating > 0 ? 'Editar avaliação' : 'Sua avaliação'}
      </h3>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Nota *</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div>
        <label htmlFor="review-comment" className="mb-1 block text-xs font-medium text-gray-700">
          Comentário (opcional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, MAX))}
          rows={3}
          placeholder="Conte o que achou desta atividade..."
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm
            text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none
            focus:ring-1 focus:ring-blue-500"
        />
        <p className={`mt-1 text-right text-xs ${remaining < 50 ? 'text-orange-500' : 'text-gray-400'}`}>
          {remaining} caracteres restantes
        </p>
      </div>

      {state === 'error' && (
        <p className="text-xs text-red-600">{errorMsg}</p>
      )}
      {errorMsg && state !== 'error' && (
        <p className="text-xs text-red-600">{errorMsg}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={state === 'loading'}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white
            hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {state === 'loading' ? 'Enviando…' : 'Enviar avaliação'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium
              text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
