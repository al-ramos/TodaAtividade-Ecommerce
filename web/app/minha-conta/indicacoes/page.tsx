'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Gift, Copy, Check, Users, Star } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

const HOW_IT_WORKS = [
  {
    title: 'Compartilhe seu link',
    desc: 'Envie seu link único para amigos e colegas professores.',
  },
  {
    title: 'Amigo se cadastra e faz a primeira compra',
    desc: 'Ele recebe 5% de desconto automático na primeira compra.',
  },
  {
    title: 'Você ganha R$ 3,00 em créditos',
    desc: 'A cada amigo que comprar, seus créditos aumentam.',
  },
]

export default function IndicacoesPage() {
  const [code, setCode] = useState<string | null>(null)
  const [credits, setCredits] = useState(0)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/referral/code')
      .then((r) => r.json())
      .then((d) => {
        setCode(d.code ?? null)
        setCredits(d.credits ?? 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const referralLink = code ? `${BASE_URL}/r/${code}` : ''

  async function handleCopy() {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: selecionar texto manualmente
    }
  }

  const creditsFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(credits / 100)

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-2xl px-4">

        {/* Cabeçalho */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/perfil"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Voltar ao perfil"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Programa de Indicação</h1>
            <p className="text-sm text-gray-500">Convide amigos e ganhe créditos</p>
          </div>
        </div>

        {/* Card de saldo */}
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <Gift className="h-5 w-5 opacity-80" />
            <span className="text-sm font-medium opacity-90">Você tem em créditos de indicação</span>
          </div>
          <p className="text-3xl font-bold">{creditsFormatted}</p>
        </div>

        {/* Card do link */}
        <div className="mb-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <p className="mb-3 text-sm font-semibold text-gray-700">Seu link de indicação</p>

          {loading ? (
            <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 truncate rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-600 ring-1 ring-gray-200">
                {referralLink || '—'}
              </div>
              <button
                onClick={handleCopy}
                disabled={!code}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? 'Copiado!' : 'Copiar link'}
              </button>
            </div>
          )}
        </div>

        {/* Como funciona */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-5 text-sm font-semibold text-gray-900">Como funciona</h2>
          <div className="space-y-5">
            {HOW_IT_WORKS.map(({ title, desc }, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
