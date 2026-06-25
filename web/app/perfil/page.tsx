import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { User, Mail, ShieldCheck, ShoppingBag } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import SignOutButton from '@/components/profile/SignOutButton'

export const metadata: Metadata = {
  title: 'Meu Perfil',
  robots: { index: false, follow: false },
}

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  'azure-ad': 'Microsoft',
  facebook: 'Facebook',
  credentials: 'E-mail e senha',
}

export default async function PerfilPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login?callbackUrl=/perfil')

  const { user } = session
  const providerLabel = PROVIDER_LABELS[user.provider ?? ''] ?? 'Conta local'
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : (user.email?.[0]?.toUpperCase() ?? 'U')

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-lg px-4">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Meu Perfil</h1>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          {/* Banner + avatar */}
          <div className="flex items-center gap-5 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? 'Avatar'}
                width={72}
                height={72}
                className="rounded-full ring-4 ring-white/30"
                priority
              />
            ) : (
              <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white ring-4 ring-white/30">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xl font-bold text-white">{user.name ?? 'Usuário'}</p>
              <p className="mt-0.5 truncate text-sm text-blue-100">{user.email}</p>
            </div>
          </div>

          {/* Campos de detalhe */}
          <div className="divide-y divide-gray-100 px-6">
            <div className="flex items-center gap-3 py-4">
              <User className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Nome</p>
                <p className="text-sm font-medium text-gray-900">{user.name ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-4">
              <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">E-mail</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-4">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Login via</p>
                <span className="mt-0.5 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {providerLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-2 px-6 pb-6 pt-2">
            <Link
              href="/minha-conta/pedidos"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <ShoppingBag className="h-4 w-4" />
              Minhas compras
            </Link>
            <SignOutButton />
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Precisa alterar sua senha?{' '}
          <Link href="/recuperar-senha" className="text-blue-600 hover:underline">
            Redefinir senha
   