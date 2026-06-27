'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { BookOpen, Mail, Lock, User, Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase-browser'
import { toast } from 'sonner'

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  function validate() {
    const e: Partial<typeof form> = {}
    if (!form.nome.trim()) e.nome = 'Nome obrigatório'
    if (!form.email.includes('@')) e.email = 'E-mail inválido'
    if (form.senha.length < 8) e.senha = 'Mínimo 8 caracteres'
    if (form.senha !== form.confirmar) e.confirmar = 'As senhas não coincidem'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading('credentials')

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: {
        data: { full_name: form.nome },
      },
    })

    if (error) {
      toast.error(
        error.message.includes('already registered')
          ? 'Este e-mail já está cadastrado.'
          : 'Erro ao criar conta. Tente novamente.'
      )
      setLoading(null)
      return
    }

    setSuccess(true)
    setLoading(null)
  }

  async function handleGoogle() {
    setLoading('google')
    await signIn('google', { callbackUrl: '/' })
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <CheckCircle className="mx-auto h-14 w-14 text-green-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Conta criada!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Enviamos um link de confirmação para <strong>{form.email}</strong>.
            Acesse seu e-mail para ativar a conta.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Ir para login
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
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-blue-600 text-xl">
            <BookOpen className="h-7 w-7" />
            <span>Toda<span className="text-gray-900">Atividade</span></span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Criar conta</h1>
          <p className="mt-1 text-sm text-gray-500">
            Já tem conta?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Entrar
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-60"
          >
            {loading === 'google' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Cadastrar com Google
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">ou com e-mail</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            {/* Nome */}
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  className={`w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.nome ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                />
              </div>
              {errors.nome && <p className="mt-1 text-xs text-red-500">{errors.nome}</p>}
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={`w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Senha */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Senha (mín. 8 caracteres)"
                  value={form.senha}
                  onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                  className={`w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.senha ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                />
              </div>
              {errors.senha && <p className="mt-1 text-xs text-red-500">{errors.senha}</p>}
            </div>

            {/* Confirmar senha */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirmar senha"
                  value={form.confirmar}
                  onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))}
                  className={`w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.confirmar ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                />
              </div>
              {errors.confirmar && <p className="mt-1 text-xs text-red-500">{errors.confirmar}</p>}
            </div>

            <button
              type="submit"
              disabled={loading !== null}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading === 'credentials' && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar conta
            </button>
          </form>

          <p className="text-center text-xs text-gray-400">
            Ao criar a conta, você concorda com nossos{' '}
            <a href="/termos" className="underline hover:text-gray-600">Termos de Uso</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
