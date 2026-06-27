'use client'

import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function NewsletterBanner() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message)
      } else {
        setStatus('error')
        setMessage(data.error ?? 'Ocorreu um erro. Tente novamente.')
      }
    } catch {
      setStatus('error')
      setMessage('Ocorreu um erro. Tente novamente.')
    }
  }

  return (
    <section className="bg-gray-900 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Receba atividades gratuitas todo mês
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Novidades, dicas pedagógicas e materiais exclusivos direto no seu e-mail.
          </p>

          {status === 'success' ? (
            <div className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-green-800/40 px-6 py-4 text-green-300">
              <span className="text-xl">✅</span>
              <p className="font-medium">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                <input
                  type="email"
                  required
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60 sm:flex-1"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'loading' ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Inscrevendo…
                    </>
                  ) : (
                    'Inscrever'
                  )}
                </button>
              </div>

              {status === 'error' && (
                <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-red-400">
                  <span>❌</span> {message}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
