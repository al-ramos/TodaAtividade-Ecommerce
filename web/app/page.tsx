import Link from 'next/link'
import { ArrowRight, BookOpen, Shield, Download } from 'lucide-react'
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

      {/* Benefit strip */}
      <div className="bg-[#FDF0F4] py-6 border-b border-[#F4C0D1]">
        <div className="max-w-4xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '⬇️', title: 'Download Automático', sub: 'PDF na hora', href: undefined },
            { icon: '🎨', title: 'Recursos Pedagógicos', sub: 'Conteúdo de qualidade', href: undefined },
            { icon: '💳', title: 'PIX Rápido', sub: 'Pagamento fácil', href: undefined },
            { icon: '💬', title: 'WhatsApp', sub: 'Clique aqui', href: 'https://wa.me/5511969622111' },
          ].map((item) => {
            const content = (
              <>
                <div className="w-12 h-12 rounded-full border-2 border-primary/40 flex items-center justify-center text-xl mx-auto">
                  {item.icon}
                </div>
                <p className="font-script text-base text-primary font-semibold">{item.title}</p>
                <p className="font-script text-xs text-gray-500">{item.sub}</p>
              </>
            )
            return item.href ? (
              <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity">
                {content}
              </a>
            ) : (
              <div key={item.title} className="flex flex-col items-center gap-2">{content}</div>
            )
          })}
        </div>
      </div>

      {/* Diferenciais */}
      <section id="diferenciais" className="border-b border-border bg-white py-10">
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
                  <h3 className="font-script text-base font-semibold text-gray-900">{title}</h3>
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
              <p className="font-script text-2xl text-primary">Novas atividades para sua sala!</p>
              <h2 className="font-script text-2xl font-bold text-gray-900">Novidades</h2>
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
