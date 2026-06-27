import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen, Shield, Download, Zap, MessageCircle, Palette } from 'lucide-react'
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
      <section>
        {/* Hero principal — fundo transparente deixa bolinhas do body aparecerem */}
        <div className="px-4 py-10 sm:px-6 md:py-14 lg:px-8 min-h-[280px] md:min-h-[380px] lg:min-h-[420px] flex items-center">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-10 md:gap-16">

            {/* Coluna texto + CTAs */}
            <div className="flex flex-1 flex-col gap-5">
              {/* Badge */}
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                🎒 Clube de Recursos Pedagógicos
              </span>

              {/* Título em Dancing Script */}
              <h1 className="font-script text-4xl leading-tight text-primary md:text-5xl">
                Recursos para{' '}
                <span className="font-bold">inspirar</span>{' '}
                sua sala de aula!
              </h1>

              {/* Subtítulo */}
              <p className="max-w-md text-base text-gray-600">
                Atividades, jogos e materiais prontos — download imediato.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/atividades"
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#9B3A58] transition-colors"
                >
                  Ver todos os recursos
                </Link>
                <Link
                  href="#diferenciais"
                  className="flex items-center gap-2 rounded-full border-2 border-[#7B3F7B] px-6 py-3 text-sm font-medium text-[#7B3F7B] hover:bg-[#7B3F7B]/10 transition-colors"
                >
                  Como funciona <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Logo com círculo decorativo — desktop only */}
            <div className="hidden md:flex flex-shrink-0 items-center justify-center">
              <div className="relative flex h-72 w-72 items-center justify-center rounded-full bg-primary/10">
                <Image
                  src="/logo-todaatividade.png"
                  width={200}
                  height={200}
                  alt="TodaAtividade"
                  className="rounded-full object-contain ring-4 ring-primary/30 shadow-xl bg-white/60"
                  priority
                />
              </div>
            </div>

          </div>
        </div>

        {/* Faixa de benefícios */}
        <div className="bg-[#7B3F7B] py-5 px-4">
          <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Download,      title: 'Download Automático',     sub: 'PDF na hora, sem espera' },
              { icon: Palette,       title: 'Recursos Pedagógicos',    sub: 'Conteúdo de qualidade' },
              { icon: Zap,           title: 'Compra Rápida',           sub: 'Pix, cartão ou boleto' },
              { icon: MessageCircle, title: 'Suporte via WhatsApp',    sub: 'Atendimento rápido' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3 text-white">
                <Icon className="h-8 w-8 flex-shrink-0 opacity-90" />
                <div>
                  <p className="font-bold text-sm leading-tight">{title}</p>
                  <p className="text-xs opacity-80">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              <p className="font-script text-2xl text-primary">Novas atividades para sua sala!</p>
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
