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
      <section className="relative w-full overflow-hidden bg-[#FDF8F5]" style={{ minHeight: '420px' }}>
        {/* Moldura decorativa dupla */}
        <div className="absolute inset-4 border border-[#E8C4B8] pointer-events-none rounded-sm" />
        <div className="absolute inset-6 border border-[#F0D0C0]/50 pointer-events-none rounded-sm" />

        {/* Ornamentos nos quatro cantos */}
        {(['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'] as const).map((pos) => (
          <div key={pos} className={`absolute ${pos} w-4 h-4 border border-[#E8C4B8] rounded-full pointer-events-none`} />
        ))}

        <div className="relative z-10 mx-auto max-w-6xl px-8 py-16 flex items-center gap-12">

          {/* ESQUERDA — conteúdo */}
          <div className="flex-1 space-y-5">
            {/* Tag */}
            <span className="inline-block text-xs tracking-widest uppercase text-[#B54E6E] border border-[#E8C4B8] px-4 py-1 rounded-full bg-white/60">
              ✦ Recursos Pedagógicos ✦
            </span>

            {/* Título Dancing Script */}
            <h1 className="font-script text-5xl md:text-6xl leading-tight text-[#8B3A55]">
              Toda Atividade
            </h1>

            {/* Divisor ornamental */}
            <div className="flex items-center gap-3">
              <div className="h-px bg-[#E8C4B8] w-20" />
              <span className="text-[#C8943A] text-sm">✦</span>
              <div className="h-px bg-[#E8C4B8] w-20" />
            </div>

            {/* Subtítulo */}
            <p className="text-[#9B6070] text-lg italic font-light leading-relaxed max-w-md">
              Atividades, jogos e materiais prontos para educação infantil e fundamental
            </p>

            <p className="text-[#B89098] text-sm tracking-wide">
              Download imediato · Alta qualidade · Feito com carinho
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/atividades"
                className="bg-[#B54E6E] text-white text-sm px-7 py-3 rounded-full hover:bg-[#9A3D5C] transition-colors shadow-sm"
              >
                Ver Recursos
              </Link>
              <Link
                href="#diferenciais"
                className="text-[#B54E6E] text-sm border border-[#E8C4B8] px-6 py-3 rounded-full hover:bg-[#FDF0F4] transition-colors flex items-center gap-1"
              >
                Como funciona <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* DIREITA — ornamento circular delicado */}
          <div className="hidden md:flex flex-col items-center justify-center flex-shrink-0">
            <div className="relative w-56 h-56">
              {/* Anéis externos */}
              <div className="absolute inset-0 rounded-full border-2 border-[#E8C4B8]" />
              <div className="absolute inset-3 rounded-full border border-[#F0D0C0]/70" />
              {/* Raios decorativos */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <div key={deg} className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="absolute bg-[#F4C0D1]/30"
                    style={{
                      width: '1px',
                      height: '50%',
                      top: 0,
                      left: '50%',
                      transformOrigin: 'bottom center',
                      transform: `rotate(${deg}deg)`,
                    }}
                  />
                </div>
              ))}
              {/* Círculo interno com logo */}
              <div className="absolute inset-8 rounded-full bg-white/80 border border-[#E8C4B8] flex items-center justify-center shadow-sm">
                <Image
                  src="/logo-todaatividade.png"
                  width={70}
                  height={70}
                  alt="TodaAtividade"
                  className="rounded-full opacity-90"
                  priority
                />
              </div>
            </div>
            <p className="mt-3 text-[#C8943A] text-xs tracking-widest uppercase">todaatividade.com.br</p>
          </div>

        </div>

        {/* Faixa de benefícios */}
        <div className="bg-[#7B3F7B] py-4 px-4">
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
