'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Mail, Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Metadata } from 'next'

// Note: metadata export não funciona em 'use client' — o título é definido no layout ou em um wrapper server component.
// Mantemos aqui como referência para quando isso for separado futuramente.

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (typeof window !== 'undefined' ? window.location.origin : '')

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/redefinir-senha`,
    })

    setLoading(false)

    if (error) {
      toast.error('Não foi possível enviar o e-mail. Tente novamente.')
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-sm text-center space-y-4">
          <CheckCircle className="mx-auto h-14 w-14 text-green-500" />
          <h2 className="text-xl font-bold text-gray-900">E-mail enviado!</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Enviamos um link de redefinição para{' '}
            <strong className="text-gray-700">{email}</strong>.{' '}
            Verifique sua caixa de entrada — o link expira em{' '}
            <strong>1 hora</strong>.
          </p>
          <p className="text-xs text-gray-400">
            Não recebeu? Verifique a pasta de spam ou{' '}
            <button
              onClick={() => setSent(false)}
              className="text-blue-600 hover:underline"
            >
              tente novamente
            </button>
            .
          </p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-blue-600 text-xl"
          >
            <BookOpen className="h-7 w-7" />
            <span>
              Toda<span className="text-gray-900">Atividade</span>
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Recuperar senha
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar link de recuperação
            </button>
          </form>

          <p className="text-center text-xs text-gray-400">
            Lembrou a senha?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
