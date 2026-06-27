import Link from 'next/link'
import { BookOpen, Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-rose-100 bg-rose-50/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">

          {/* Marca */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-rose-500">
              <BookOpen className="h-5 w-5" />
              <span>Toda<span className="text-rose-900">Atividade</span></span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Atividades pedagógicas de qualidade para o ensino fundamental,
              prontas para imprimir.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="https://instagram.com/todaatividade" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://facebook.com/todaatividade" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-rose-500 transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Séries */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Anos Iniciais</h3>
            <ul className="mt-3 space-y-2">
              {['1º Ano','2º Ano','3º Ano','4º Ano','5º Ano'].map((ano, i) => (
                <li key={ano}>
                  <Link href={`/atividades?grade=${i+1}ano`}
                    className="text-sm text-gray-500 hover:text-rose-500 transition-colors">
                    {ano}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Séries */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Anos Finais</h3>
            <ul className="mt-3 space-y-2">
              {['6º Ano','7º Ano','8º Ano','9º Ano'].map((ano, i) => (
                <li key={ano}>
                  <Link href={`/atividades?grade=${i+6}ano`}
                    className="text-sm text-gray-500 hover:text-rose-500 transition-colors">
                    {ano}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links legais */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Institucional</h3>
            <ul className="mt-3 space-y-2">
              {[
                { href: '/sobre', label: 'Sobre nós' },
                { href: '/contato', label: 'Contato' },
                { href: '/termos', label: 'Termos de uso' },
                { href: '/privacidade', label: 'Política de privacidade' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-rose-500 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-rose-100 pt-8 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} TodaAtividade. Todos os direitos reservados.
            Pagamentos processados com segurança pelo Mercado Pago.
          </p>
        </div>
      </div>
    </footer>
  )
}
