interface ProductJsonLdProps {
  name: string
  description?: string
  image?: string
  price: number
  slug: string
  rating?: { value: number; count: number }
}

export function ProductJsonLd({ name, description, image, price, slug, rating }: ProductJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.todaatividade.com.br'
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : undefined,
    url: `${baseUrl}/atividades/${slug}`,
    offers: {
      '@type': 'Offer',
      price: (price / 100).toFixed(2),
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'TodaAtividade' },
    },
    ...(rating && rating.count > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.value.toFixed(1),
        reviewCount: rating.count,
        bestRating: 5,
        worstRating: 1,
      }
    } : {}),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
