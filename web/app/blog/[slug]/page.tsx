import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

const BASE_URL = 'https://www.todaatividade.com.br'

interface Props { params: { slug: string } }

type Article = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  author_name: string
  published_at: string | null
}

async function getArticle(slug: string): Promise<Article | null> {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .single()
  return data as Article | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug)
  if (!article) return { title: 'Artigo não encontrado' }

  const url = `${BASE_URL}/blog/${params.slug}`

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: `${article.title} | Blog TodaAtividade`,
      description: article.excerpt,
      url,
      type: 'article',
      siteName: 'TodaAtividade',
      locale: 'pt_BR',
      ...(article.cover_image_url && {
        images: [{ url: article.cover_image_url, alt: article.title }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | Blog TodaAtividade`,
      description: article.excerpt,
      ...(article.cover_image_url && { images: [article.cover_image_url] }),
    },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug)
  if (!article) notFound()

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: { '@type': 'Organization', name: article.author_name },
    datePublished: article.published_at,
    dateModified: article.published_at,
    url: `${BASE_URL}/blog/${article.slug}`,
    ...(article.cover_image_url && { image: article.cover_image_url }),
    publisher: {
      '@type': 'Organization',
      name: 'TodaAtividade',
      url: BASE_URL,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BreadcrumbJsonLd items={[
        { name: 'TodaAtividade', url: BASE_URL },
        { name: 'Blog', url: `${BASE_URL}/blog` },
        { name: article.title, url: `${BASE_URL}/blog/${article.slug}` },
      ]} />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { label: 'Início', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: article.title },
        ]} />

        {article.cover_image_url && (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl">
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
          {article.title}
        </h1>

        <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
          <span>{article.author_name}</span>
          <span aria-hidden>·</span>
          {article.published_at && (
            <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
          )}
        </div>

        <div
          className="prose prose-gray mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </>
  )
}
