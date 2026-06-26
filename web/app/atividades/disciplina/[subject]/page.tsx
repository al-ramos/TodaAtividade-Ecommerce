import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import ProductCard from '@/components/catalog/ProductCard'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { DISCIPLINE_LABELS, type Discipline, type Product } from '@/lib/types'

const BASE_URL = 'https://www.todaatividade.com.br'

const VALID_SUBJECTS = new Set<Discipline>([
  'matematica', 'portugues', 'ciencias', 'historia',
  'geografia', 'artes', 'educacao-fisica', 'ingles',
])

export function generateStaticParams() {
  return Array.from(VALID_SUBJECTS).map((subject) => ({ subject }))
}

export async function generateMetadata(
  { params }: { params: { subject: string } }
): Promise<Metadata> {
  const subject = params.subject as Discipline
  if (!VALID_SUBJECTS.has(subject)) return {}
  const label = DISCIPLINE_LABELS[subject]
  const title = `Atividades de ${label} em PDF | TodaAtividade`
  const description = `Baixe atividades de ${label} em PDF para o ensino fundamental. Conteúdos pedagógicos prontos para usar em sala de aula.`
  const url = `${BASE_URL}/atividades/disciplina/${params.subject}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: 'TodaAtividade', locale: 'pt_BR' },
  }
}

async function getProductsBySubject(subject: Discipline): Promise<Product[]> {
  const { data } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('active', true)
    .eq('discipline', subject)
    .order('created_at', { ascending: false })
  return (data as Product[]) ?? []
}

interface PageProps {
  params: { subject: string }
}

export default async function SubjectLandingPage({ params }: PageProps) {
  const subject = params.subject as Discipline
  if (!VALID_SUBJECTS.has(subject)) notFound()

  const label = DISCIPLINE_LABELS[subject]
  const products = await getProductsBySubject(subject)
  const canonicalUrl = `${BASE_URL}/atividades/disciplina/${params.subject}`

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Atividades de ${label} em PDF`,
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
          {products.length === 1 ? 'atividade encontrada' : 'atividades encontradas'} de{' '}
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
              Nenhuma atividade encontrada de {label}.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
