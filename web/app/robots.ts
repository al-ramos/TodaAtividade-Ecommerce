import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/checkout', '/pedido', '/minha-conta', '/perfil'],
      },
    ],
    sitemap: 'https://www.todaatividade.com.br/sitemap.xml',
  }
}
