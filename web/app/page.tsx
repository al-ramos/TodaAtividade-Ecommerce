import Link from 'next/link'
import { ArrowRight, BookOpen, Shield, Download, Star } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase'
import ProductCard from '@/components/catalog/ProductCard'
import type { Product } from '@/lib/types'
import { OrganizationJsonLd } from '@/components/seo/OrganizationJsonLd'
import NewsletterBanner from '@/components/newsletter/NewsletterBanner'

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(8)
  return (data as Product[]) ?? []
}

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <>
      <OrganizationJsonLd />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#F8D7E3] to-[#FDF0F4] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              +500 atividades disponíveis
            </span>
            <h1 className="mt-4 text-4xl font-heading font-bold leading-tight text-[#B54E6E] sm:text-5xl lg:text-6xl">
              Atividades escolares prontas para imprimir
            </h1>
            <p className="mt-6 text-lg text-[#B54E6E]/70">
              Do 1 ao 9 ano do ensino fundamental. Visualize a prévia, compre com Pix ou cartão e baixe o PDF na hora.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/atividades"
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-[#9B3A58] transition-colors"
              >
                Ver catálogo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/atividades?grade=1ano"
                className="flex items-center gap-2 rounded-xl border border-primary px-6 py-3 text-base font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                Anos Iniciais
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="border-b border-border bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { icon: BookOpen, title: 'Prévia antes de comprar', desc: 'Veja a 1ª página de cada atividade antes de decidir.' },
              { icon: Download, title: 'Download imediato', desc: 'Após o pagamento, o PDF chega no seu e-mail na hora.' },
              { icon: Shield, title: 'Pagamento seguro', desc: 'Pix, boleto e cartão via Mercado Pago. 100% seguro.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 rounded-xl p-4">
                <div className="flex-shrink-0 rounded-lg bg-primary-veryLight p-2.5">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                  <p className="mt-0.5 text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Atividades em destaque */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Novidades</h2>
              <p className="mt-1 text-sm text-gray-500">As últimas atividades adicionadas ao catálogo</p>
            </div>
            <Link href="/atividades" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-[#9B3A58]">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-primary-light" />
              <p className="mt-3 text-sm text-gray-500">Em breve, atividades incríveis aqui.</p>
              <Link
                href="/atividades"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Explorar catálogo <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <NewsletterBanner />
    </>
  )
}
