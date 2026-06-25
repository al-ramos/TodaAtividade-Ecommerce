import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politica de Privacidade',
  robots: { index: false, follow: false },
}

export default function PrivacidadePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Politica de Privacidade</h1>
      <p className="text-sm text-gray-400 mb-8">Ultima atualizacao: junho de 2026</p>
      <div className="space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Quem somos</h2>
          <p>TodaAtividade e uma plataforma digital de venda de atividades pedagogicas em PDF para o ensino fundamental. Responsavel: Alessandro Ramos &mdash; <a href="mailto:contato@todaatividade.com.br" className="text-indigo-600 hover:underline">contato@todaatividade.com.br</a></p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Dados coletados</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Identificacao:</strong> nome e e-mail (cadastro ou Google OAuth).</li>
            <li><strong>Pagamento:</strong> processado pelo Mercado Pago. Nao armazenamos dados de cartao.</li>
            <li><strong>Uso:</strong> paginas visitadas, cliques (Vercel Analytics, Meta Pixel).</li>
            <li><strong>Logs:</strong> IP, navegador, data/hora (Vercel, Sentry).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Finalidade</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Gestao de conta e processamento de pedidos.</li>
            <li>Envio de e-mails transacionais (confirmacao, downloads).</li>
            <li>Monitoramento de erros e performance.</li>
            <li>Melhoria de servicos e publicidade (com consentimento).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Base legal (LGPD Art. 7)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Execucao de contrato:</strong> processamento e entrega de PDFs.</li>
            <li><strong>Consentimento:</strong> marketing e cookies de terceiros.</li>
            <li><strong>Interesse legitimo:</strong> seguranca e prevencao de fraudes.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Compartilhamento</h2>
          <p>Dados compartilhados somente com: Mercado Pago (pagamentos), Supabase (banco SP), Cloudflare R2 (PDFs), Resend (e-mail), Vercel (hospedagem), Sentry (erros), Meta (Pixel, se ativo). Nao vendemos seus dados.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Seus direitos (LGPD Art. 18)</h2>
          <p>Voce pode solicitar acesso, correcao, exclusao ou portabilidade dos seus dados. Contato: <a href="mailto:contato@todaatividade.com.br" className="text-indigo-600 hover:underline">contato@todaatividade.com.br</a></p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Retencao</h2>
          <p>Dados mantidos enquanto a conta estiver ativa, ou pelo prazo legal (ate 5 anos para registros fiscais). Exclusao em ate 30 dias apos solicitacao.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Cookies</h2>
          <p>Usamos cookies essenciais (autenticacao) e de terceiros (analytics, publicidade). Voce pode desabilitar cookies de terceiros no seu navegador.</p>
        </section>

      </div>
    </main>
  )
}
