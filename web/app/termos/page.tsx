import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  robots: { index: false, follow: false },
}

export default function TermosPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
      <p className="text-sm text-gray-400 mb-8">Ultima atualizacao: junho de 2026</p>
      <div className="space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Aceite dos Termos</h2>
          <p>Ao criar uma conta ou realizar uma compra na TodaAtividade, voce concorda com estes Termos de Uso. Se nao concordar, nao utilize a plataforma.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Servico</h2>
          <p>A TodaAtividade comercializa atividades pedagogicas digitais em formato PDF para uso no ensino fundamental. Os arquivos sao para uso pessoal ou de sala de aula pelo comprador. E vedada a revenda, redistribuicao ou disponibilizacao publica dos arquivos.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Conta de usuario</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Voce e responsavel pela seguranca da sua senha.</li>
            <li>E proibido compartilhar sua conta com terceiros.</li>
            <li>Reservamo-nos o direito de suspender contas com atividade suspeita.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Pagamentos e reembolso</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pagamentos processados pelo Mercado Pago (Pix e cartao de credito).</li>
            <li>Apos o download bem-sucedido do arquivo, nao ha reembolso.</li>
            <li>Em caso de falha tecnica comprovada, entre em contato em 72h.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Propriedade intelectual</h2>
          <p>Todo o conteudo da plataforma (atividades, imagens, textos) e protegido por direitos autorais. A compra concede ao usuario uma licenca de uso pessoal, nao transferivel e nao exclusiva.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Limitacao de responsabilidade</h2>
          <p>A TodaAtividade nao se responsabiliza por uso inadequado dos materiais, problemas de impressao ou incompatibilidade com sistemas de terceiros. O servico e fornecido &quot;como esta&quot;.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Alteracoes dos Termos</h2>
          <p>Podemos atualizar estes Termos a qualquer momento. Alteracoes significativas serao comunicadas por e-mail. O uso continuado da plataforma apos a notificacao implica aceite das mudancas.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Legislacao aplicavel</h2>
          <p>Estes Termos sao regidos pela legislacao brasileira. Foro: comarca de Sao Paulo/SP, salvo legislacao especifica do consumidor.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Contato</h2>
          <p>Duvidas sobre os Termos: <a href="mailto:contato@todaatividade.com.br" className="text-indigo-600 hover:underline">contato@todaatividade.com.br</a></p>
        </section>

      </div>
    </main>
  )
}
