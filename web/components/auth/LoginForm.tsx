'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Mail, Lock, Loader2 } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSocial(provider: string) {
    setLoading(provider)
    await signIn(provider, { callbackUrl: '/' })
  }

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setLoading('credentials')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      toast.error('E-mail ou senha incorretos.')
      setLoading(null)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
      {/* Social logins */}
      <div className="space-y-2.5">
        {[
          { provider: 'google', label: 'Continuar com Google', color: 'hover:bg-red-50 hover:border-red-200',
            icon: (
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            )},
          { provider: 'azure-ad', label: 'Continuar com Microsoft', color: 'hover:bg-blue-50 hover:border-blue-200',
            icon: (
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#f25022" d="M1 1h10v10H1z"/><path fill="#7fba00" d="M13 1h10v10H13z"/><path fill="#00a4ef" d="M1 13h10v10H1z"/><path fill="#ffb900" d="M13 13h10v10H13z"/></svg>
            )},
          { provider: 'facebook', label: 'Continuar com Facebook', color: 'hover:bg-blue-50 hover:border-blue-200',
            icon: (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            )},
        ].map(({ provider, label, color, icon }) => (
          <button
            key={provider}
            onClick={() => handleSocial(provider)}
            disabled={loading !== null}
            className={`flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors disabled:opacity-60 ${color}`}
          >
            {loading === provider ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
            {label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-gray-400">ou entre com e-mail</span>
        </div>
      </div>

      {/* Email/senha */}
      <form onSubmit={handleCredentials} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="text-right">
          <a href="/recuperar-senha" className="text-xs text-blue-600 hover:underline">Esqueci minha senha</a>
        </div>
        <button
          type="submit"
          disabled={loading !== null}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {loading === 'credentials' && <Loader2 className="h-4 w-4 animate-spin" />}
          Entrar
        </button>
      </form>
    </div>
  )
}
