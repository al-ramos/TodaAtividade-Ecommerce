import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import ProductCard from '@/components/catalog/ProductCard'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { GRADE_LABELS, type GradeLevel, type Product } from '@/lib/types'

const BASE_URL = 'https://www.todaatividade.com.br'

const GRADE_SLUG_TO_LEVEL: Record<string, GradeLevel> = {
  '1-ano': '1ano', '2-ano': '2ano', '3-ano': '3ano',
  '4-ano': '4ano', '5-ano': '5ano', '6-ano': '6ano',
  '7-ano': '7ano', '8-ano': '8ano', '9-ano': '9ano',
}

export function generateStaticParams() {
  return Object.keys(GRADE_SLUG_TO_LEVEL).map((grade) => ({ grade }))
}

export async function generateMetadata(
  { params }: { params: { grade: string } }
): Promise<Metadata> {
  const level = GRADE_SLUG_TO_LEVEL[params.grade]
  if (!level) return {}
  const label = GRADE_LABELS[level]
  const title = `Atividades ${label} em PDF | TodaAtividade`
  const description = `Baixe atividades pedagógicas de ${label} em PDF. Matemática, Português, Ciências e muito mais para o ensino fundamental.`
  const url = `${BASE_URL}/atividades/serie/${params.grade}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: 'TodaAtividade', locale: 'pt_BR' },
  }
}

async function getProductsByGrade(level: GradeLevel): Promise<Product[]> {
  const { data } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('active', true)
    .eq('grade_level', level)
    .order('created_at', { ascending: false })
  return (data as Product[]) ?? []
}

interface PageProps {
  params: { grade: string }
}

export default async function GradeLandingPage({ params }: PageProps) {
  const level = GRADE_SLUG_TO_LEVEL[params.grade]
  if (!level) notFound()

  const label = GRADE_LABELS[level]
  const products = await getProductsByGrade(level)
  const canonicalUrl = `${BASE_URL}/atividades/serie/${params.grade}`

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Atividades ${label} em PDF`,
    url: canonicalUrl,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE_URL}/atividades/${p.slug}`,
    })),
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Início', url: BASE_URL },
          { name: 'Atividades', url: `${BASE_URL}/atividades` },
          { name: label, url: canonicalUrl },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: 'Início', href: '/' },
            { label: 'Atividades', href: '/atividades' },
            { label: label },
          ]}
        />

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Atividades de {label} em PDF
        </h1>
        <p className="mb-8 text-gray-500">
          {products.length}{' '}
          {products.length === 1 ? 'atividade encontrada' : 'atividades encontradas'} para{' '}
          {label}
        </p>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} isFavorite={false} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20">
            <p className="text-sm text-gray-500">
              Nenhuma atividade encontrada para {label}.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
