import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'

const BASE_URL = 'https://www.todaatividade.com.br'

export const metadata: Metadata = {
  title: 'Blog — TodaAtividade',
  description: 'Artigos educativos e dicas pedagógicas para professores do ensino fundamental.',
  alternates: { canonical: `${BASE_URL}/blog` },
  openGraph: {
    title: 'Blog — TodaAtividade',
    description: 'Artigos educativos e dicas pedagógicas para professores do ensino fundamental.',
    url: `${BASE_URL}/blog`,
    siteName: 'TodaAtividade',
    locale: 'pt_BR',
  },
}

type Article = {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image_url: string | null
  author_name: string
  published_at: string
}

async function getArticles(): Promise<Article[]> {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, cover_image_url, author_name, published_at')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(12)
  return (data as Article[]) ?? []
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BlogPage() {
  const articles = await getArticles()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
        <p className="mt-2 text-gray-500">Artigos educativos e dicas pedagógicas para professores</p>
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
          <p className="text-lg font-medium">Em breve — novos artigos</p>
          <p className="text-sm">Acompanhe nossas novidades em breve.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.id}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              {article.cover_image_url ? (
                <div className="relative aspect-video">
                  <Image
                    src={article.cover_image_url}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <span className="text-4xl">📚</span>
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <time dateTime={article.published_at} className="text-xs text-gray-400">
                  {formatDate(article.published_at)}
                </time>
                <h2 className="mt-2 text-base font-bold text-gray-900 line-clamp-2">
                  {article.title}
                </h2>
                <p className="mt-2 flex-1 text-sm text-gray-600 line-clamp-3">
                  {article.excerpt}
                </p>
                <Link
                  href={`/blog/${article.slug}`}
                  className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Ler mais →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
