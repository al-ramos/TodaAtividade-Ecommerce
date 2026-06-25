import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase'
import ProductCard from '@/components/catalog/ProductCard'
import FiltrosCatalogo from '@/components/catalog/FiltrosCatalogo'
import ResultadosBusca from '@/components/catalog/ResultadosBusca'
import type { Product } from '@/lib/types'

interface ReviewSummary {
  product_id: string
  average_rating: number
  review_count: number
}

async function getReviewSummaries(productIds: string[]): Promise<Map<string, ReviewSummary>> {
  if (productIds.length === 0) return new Map()

  const { data } = await supabaseAdmin
    .from('reviews')
    .select('product_id, rating')
    .in('product_id', productIds)

  const map = new Map<string, ReviewSummary>()
  if (!data) return map

  const grouped: Record<string, number[]> = {}
  data.forEach((r: { product_id: string; rating: number }) => {
    if (!grouped[r.product_id]) grouped[r.product_id] = []
    grouped[r.product_id].push(r.rating)
  })

  Object.entries(grouped).forEach(([pid, ratings]) => {
    const avg = ratings.reduce((s, v) => s + v, 0) / ratings.length
    map.set(pid, {
      product_id: pid,
      average_rating: Math.round(avg * 10) / 10,
      review_count: ratings.length,
    })
  })

  return map
}

export const metadata: Metadata = {
  title: 'Catálogo de Atividades',
  description:
    'Explore centenas de atividades pedagógicas em PDF para ensino fundamental. Filtre por série (1º ao 9º ano), disciplina e muito mais.',
  alternates: { canonical: 'https://www.todaatividade.com.br/atividades' },
  openGraph: {
    title: 'Catálogo de Atividades | TodaAtividade',
    description:
      'Explore centenas de atividades pedagógicas em PDF para ensino fundamental. Filtre por série (1º ao 9º ano), disciplina e muito mais.',
    url: 'https://www.todaatividade.com.br/atividades',
    type: 'website',
    siteName: 'TodaAtividade',
    locale: 'pt_BR',
  },
}

const PAGE_SIZE = 12

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface SearchParams {
  /** Busca por texto (título OU descrição) */
  q?: string
  /** Compatibilidade com param antigo */
  search?: string
  grade?: string
  discipline?: string
  /** Faixas: 'free' | '20' | '50' | '50plus' */
  preco?: string
  /** 'recente' (default) | 'menor_preco' | 'maior_preco' | 'az' */
  ordem?: string
  page?: string
}

// ─── Busca no Supabase ────────────────────────────────────────────────────────

async function getProducts(
  sp: SearchParams,
): Promis