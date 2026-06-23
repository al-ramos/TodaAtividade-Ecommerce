import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import LoginForm from '@/components/auth/LoginForm'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Entrar',
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/')

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-blue-600 text-xl">
            <BookOpen className="h-7 w-7" />
            <span>Toda<span className="text-gray-900">Atividade</span></span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Entrar na conta</h1>
          <p className="mt-1 text-sm text-gray-500">
            Não tem conta?{' '}
            <Link href="/cadastro" className="font-medium text-blue-600 hover:text-blue-700">
              Criar agora
            </Link>
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
