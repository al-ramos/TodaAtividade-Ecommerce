'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  Lock,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase-browser'
import { toast } from 'sonner'

type SessionState = 'loading' | 'ready' | 'invalid'

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [sessionState, setSessionState] = useState<SessionState>('loading')
  const [form, setForm] = useState({ senha: '', confirmar: '' })
  const [errors, setErrors] = useState<Partial<typeof form>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Verifica se há um código PKCE na URL (recuperação de senha via e-mail)
    const code = new URLSearchParams(window.location.search).get('code')

    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            setSessionState('invalid')
          } else {
            // Remove o code da URL para não vazar tokens no histórico
            window.history.replaceState({}, '', '/redefinir-senha')
            setSessionState('ready')
          }
        })
    } else {
      // Fluxo implícito ou sessão já existente
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSessionState(session ? 'ready' : 'invalid')
      })
    }
  }, [])

  function validate() {
    const e: Partial<typeof form> = {}
    if (form.senha.length < 8) e.senha = 'Mínimo 8 caracteres'
    if (form.senha !== form.confirmar) e.confirmar = 'As senhas não coincidem'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: form.senha })
    setLoading(false)

    if (error) {
      toast.error(
        'Erro ao redefinir senha. O link pode ter expirado — solicite um novo.'
      )
      return
    }

    // Desconecta a sessão Supabase de recuperação; usuário fará login normalmente
    await supabase.auth.signOut()
    setSuccess(true)
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (sessionState === 'loading') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // ─── Link inválido / expirado ─────────────────────────────────────────────
  if (sessionState === 'invalid') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <AlertCircle className="mx-auto h-14 w-14 text-amber-400" />
          <h2 className="text-xl font-bold text-gray-900">
            Link inválido ou expirado
          </h2>
          <p className="text-sm text-gray-500">
            Este link de recuperação não é mais válido. Os links expiram em 1
            hora após o envio.
          </p>
          <Link
            href="/recuperar-senha"
            className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Solicitar novo link
          </Link>
        </div>
      </div>
    )
  }

  // ─── Sucesso ──────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <CheckCircle className="mx-auto h-14 w-14 text-green-500" />
          <h2 className="text-xl font-bold text-gray-900">
            Senha redefinida!
          </h2>
          <p className="text-sm text-gray-500">
            Sua senha foi alterada com sucesso. Faça login com a nova senha.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  // ─── Formulário de nova senha ─────────────────────────────────────────────
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
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Nova senha</h1>
          <p className="mt-1 text-sm text-gray-500">
            Escolha uma senha segura com pelo menos 8 caracteres.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            {/* Nova senha */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={form.senha}
                  onChange={e =>
                    setForm(f => ({ ...f, senha: e.target.value }))
                  }
                  autoComplete="new-password"
                  className={`w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.senha
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.senha && (
                <p className="mt-1 text-xs text-red-500">{errors.senha}</p>
              )}
            </div>

            {/* Confirmar senha */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={form.confirmar}
                  onChange={e =>
                    setForm(f => ({ ...f, confirmar: e.target.value }))
                  }
                  autoComplete="new-password"
                  className={`w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.confirmar
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.confirmar && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmar}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Redefinir senha
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
