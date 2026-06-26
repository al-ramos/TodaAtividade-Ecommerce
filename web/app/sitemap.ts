import { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

const BASE_URL = 'https://www.todaatividade.com.br'

const GRADE_SLUGS = ['1-ano', '2-ano', '3-ano', '4-ano', '5-ano', '6-ano', '7-ano', '8-ano', '9-ano']
const SUBJECT_SLUGS = ['matematica', 'portugues', 'ciencias', 'historia', 'geografia', 'artes', 'educacao-fisica', 'ingles']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/atividades`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cadastro`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...GRADE_SLUGS.map((grade) => ({
      url: `${BASE_URL}/atividades/serie/${grade}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...SUBJECT_SLUGS.map((subject) => ({
      url: `${BASE_URL}/atividades/disciplina/${subject}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('slug, created_at')
    .eq('active', true)

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${BASE_URL}/atividades/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes]
}
