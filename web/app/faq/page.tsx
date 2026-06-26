import { Metadata } from 'next'
import Script from 'next/script'

const BASE_URL = 'https://www.todaatividade.com.br'

export const metadata: Metadata = {
  title: 'FAQ — Perguntas Frequentes | TodaAtividade',
  description: 'Tire suas dúvidas sobre atividades educativas, pagamento, download e mais.',
  alternates: {
    canonical: `${BASE_URL}/faq`,
  },
}

const faqs = [
  {
    question: 'O que é a TodaAtividade?',
    answer:
      'A TodaAtividade é uma plataforma de atividades educativas para professores e pais, com materiais para Ensino Fundamental I e II organizados por série e disciplina.',
  },
  {
    question: 'Como faço o download após a compra?',
    answer:
      'Após o pagamento confirmado, acesse Minha Conta → Meus Pedidos e clique no botão de download. Arquivos em PDF prontos para imprimir.',
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer: 'Aceitamos Pix (aprovação imediata) e cartão de crédito em até 12x via Stripe.',
  },
  {
    question: 'Posso usar as atividades na minha escola?',
    answer:
      'Sim! Todas as atividades são licenciadas para uso em sala de aula e impressão em quantidade para os alunos. Não é permitida a revenda.',
  },
  {
    question: 'Como funciona o programa de indicação?',
    answer:
      'Indique amigos e ganhe 5% de crédito a cada compra realizada pelo seu link. Os créditos são aplicados automaticamente no próximo pedido.',
  },
  {
    question: 'Posso pedir reembolso?',
    answer:
      'Sim, dentro de 7 dias após a compra, se os arquivos não puderem ser baixados por problema técnico nosso. Entre em contato pelo e-mail suporte@todaatividade.com.br.',
  },
  {
    question: 'Como filtrar atividades por série ou disciplina?',
    answer:
      'Use os filtros na página de atividades ou acesse diretamente as páginas de série (/atividades/serie/1-ano) e disciplina (/atividades/disciplina/matematica).',
  },
  {
    question: 'A TodaAtividade tem newsletter?',
    answer:
      'Sim! Inscreva-se no rodapé do site para receber atividades gratuitas e novidades mensalmente.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}

export default function FaqPage() {
  return (
    <>
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Perguntas Frequentes</h1>
            <p className="text-gray-500 text-lg">Tudo o que você precisa saber sobre a TodaAtividade</p>
          </div>

          <div className="divide-y divide-gray-200 border-t border-gray-200">
            {faqs.map((faq) => (
              <details key={faq.question} className="group">
                <summary className="cursor-pointer font-semibold py-4 border-b border-transparent text-gray-900 hover:text-blue-600 transition-colors list-none flex items-center justify-between group-open:text-blue-600">
                  {faq.question}
                  <span className="ml-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <p className="p-4 text-gray-600 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
